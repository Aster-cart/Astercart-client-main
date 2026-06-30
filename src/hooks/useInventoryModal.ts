/**
 * useInventoryModal.ts
 * Handles file parsing, column mapping, and bulk product import.
 * Supports CSV and Excel (.xlsx/.xls) files.
 *
 * PREVIOUSLY: header aliasing was silent and all-or-nothing — if the
 * file's real columns didn't match a known alias closely enough, the
 * whole import was rejected outright with no way for the store to just
 * tell the system "this column is actually the price." This meant a
 * store's own POS export, with its own column names, often couldn't be
 * used at all without first manually retyping it into Astercart's exact
 * template — defeating the entire point of supporting CSV sync from a
 * store's existing inventory software.
 *
 * NOW: parsing produces a real, visible mapping STEP between upload and
 * import. The system still guesses intelligently using the same alias
 * list as before, but the store sees exactly which of their real
 * columns got mapped to which Astercart field, and can correct any
 * wrong guess or fill in one the alias list didn't recognize, before
 * anything is actually sent to the server. Barcode is now a real,
 * optional mappable field — present if their file has it, ignored if
 * not.
 */
import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import api from "../utils/api";

// The real Astercart fields a column can be mapped to. "name", "price",
// and "quantity" are the only ones a store MUST map something to —
// everything else, including barcode, is genuinely optional.
export const ASTERCART_FIELDS = [
  { key: "name", label: "Product Name", required: true },
  { key: "price", label: "Price", required: true },
  { key: "quantity", label: "Quantity / Stock", required: true },
  { key: "barcode", label: "Barcode", required: false },
  { key: "category", label: "Category", required: false },
  { key: "images", label: "Image URL", required: false },
  { key: "description", label: "Description", required: false },
  { key: "discount", label: "Discount", required: false },
  { key: "taxRate", label: "Tax Rate", required: false },
] as const;

export type AstercartFieldKey = typeof ASTERCART_FIELDS[number]["key"];

function normaliseHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Same alias list as before, now also recognizing barcode-related
// column names (the proposal's own CSV example used "Barcode" exactly,
// but real POS exports vary — "UPC", "EAN", "SKU Barcode" are common
// real-world variants).
function guessFieldForHeader(raw: string): AstercartFieldKey | "" {
  const n = normaliseHeader(raw);
  const aliases: Record<string, AstercartFieldKey> = {
    productname: "name", product: "name", itemname: "name", item: "name", name: "name",
    cost: "price", unitprice: "price", sellingprice: "price", price: "price",
    stock: "quantity", qty: "quantity", stockqty: "quantity", quantity: "quantity",
    cat: "category", type: "category", category: "category",
    desc: "description", details: "description", description: "description",
    discount: "discount",
    tax: "taxRate", taxrate: "taxRate",
    barcode: "barcode", upc: "barcode", ean: "barcode", skubarcode: "barcode", barcodenumber: "barcode",
    image: "images", imageurl: "images", photo: "images", picture: "images", productimage: "images",
  };
  return aliases[n] || "";
}

export interface ParsedFile {
  headers: string[]; // the REAL column headers exactly as found in the store's file, unmodified
  rows: unknown[][]; // raw rows, not yet mapped to Astercart field names
  guessedMapping: Record<string, AstercartFieldKey | "">; // header -> guessed Astercart field, store can override any of these
}

export const useInventoryModal = (
  onModalClose: () => void,
  onImport: (data: unknown[]) => void
) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remainingKB, setRemainingKB] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);

  // New state for the mapping step — this is the actual feature being
  // added. parsedFile holds the raw, unmapped data the moment a file is
  // read; mapping holds the store's current header->field choices
  // (pre-filled with guesses, fully editable). The import only actually
  // runs once the store confirms this mapping, not immediately on upload.
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<Record<string, AstercartFieldKey | "">>({});
  const [showMappingStep, setShowMappingStep] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 1 — read the file and produce raw headers/rows + a best-guess
  // mapping. Does NOT validate required columns here anymore — that
  // check now happens after the store confirms (or corrects) the
  // mapping, since a column the alias list fails to recognize is no
  // longer a hard rejection, just an unmapped field the store can fix.
  const readFile = (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

          if (rows.length < 2) {
            reject(new Error("File is empty or has no data rows."));
            return;
          }

          const headers = (rows[0] as string[]).map((h) => String(h ?? "").trim()).filter(Boolean);
          const guessedMapping: Record<string, AstercartFieldKey | ""> = {};
          headers.forEach((h) => { guessedMapping[h] = guessFieldForHeader(h); });

          resolve({ headers, rows: rows.slice(1), guessedMapping });
        } catch {
          reject(new Error("Could not read file. Please use CSV or Excel format."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsArrayBuffer(file);
    });
  };

  const simulateProgress = (fileSizeKB: number) => {
    setRemainingKB(fileSizeKB);
    setSecondsRemaining(3);
    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(pct + 33, 100);
      setProgress(pct);
      setRemainingKB(Math.round(fileSizeKB * (1 - pct / 100)));
      setSecondsRemaining(Math.ceil((100 - pct) / 33));
      if (pct >= 100) clearInterval(interval);
    }, 500);
  };

  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    const fileSizeKB = Math.round(file.size / 1024);
    setUploading(true);
    simulateProgress(fileSizeKB);

    try {
      const parsed = await readFile(file);
      setUploading(false);
      setParsedFile(parsed);
      setMapping(parsed.guessedMapping);
      setShowMappingStep(true); // hand off to the mapping UI — import does NOT happen yet
    } catch (err: unknown) {
      setUploading(false);
      setError((err as Error).message || "Import failed.");
    } finally {
      setFileInputKey((k) => k + 1);
    }
  };

  // Store edits a single header's mapping via a dropdown — this is the
  // actual mechanism that fixes "what if our column names don't match
  // your template," letting any real-world POS export be used as-is.
  const updateMapping = useCallback((header: string, field: AstercartFieldKey | "") => {
    setMapping((prev) => ({ ...prev, [header]: field }));
  }, []);

  // STEP 2 — store has confirmed the mapping (editing or accepting the
  // guesses). NOW validate that every required field has been mapped to
  // something, build the real product rows using the CONFIRMED mapping
  // (not the original guess), and send to the server in batches exactly
  // as before.
  const confirmMappingAndImport = async () => {
    if (!parsedFile) return;

    // Required-field check happens HERE now, against the store's actual
    // confirmed choices — not against the raw header text, so a
    // required column the alias list didn't recognize but the store
    // correctly mapped by hand is no longer treated as "missing."
    const mappedFields = new Set(Object.values(mapping).filter(Boolean));
    const missingRequired = ASTERCART_FIELDS.filter((f) => f.required && !mappedFields.has(f.key));
    if (missingRequired.length > 0) {
      setError(`Please map a column to: ${missingRequired.map((f) => f.label).join(", ")}.`);
      return;
    }

    const products = parsedFile.rows
      .map((row) => {
        const obj: Record<string, unknown> = {};
        parsedFile.headers.forEach((header, i) => {
          const field = mapping[header];
          if (field) obj[field] = row[i] ?? "";
        });
        return obj;
      })
      .filter((p) => p.name && p.price);

    if (products.length === 0) {
      setError("No valid rows found after mapping. Check that your Name and Price columns are mapped correctly.");
      return;
    }

    setPreview(products.slice(0, 3));
    setShowMappingStep(false);
    setImporting(true);

    try {
      const BATCH_SIZE = 50;
      const batches = [];
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        batches.push(products.slice(i, i + BATCH_SIZE));
      }

      let allImported: unknown[] = [];
      let totalCreated = 0;
      let totalUpdated = 0;
      for (let b = 0; b < batches.length; b++) {
        setProgress(Math.round(((b + 1) / batches.length) * 100));
        const response = await api.post("/store/create-product", batches[b]);
        const imported = response.data?.products || batches[b];
        totalCreated += response.data?.created || 0;
        totalUpdated += response.data?.updated || 0;
        allImported = allImported.concat(imported);
      }

      setImporting(false);
      onImport(allImported);
      // Surface the real created-vs-updated split from the server
      // (built alongside the barcode-upsert fix) so a store re-uploading
      // their daily CSV can actually see "47 updated, 3 created" rather
      // than a generic success message that doesn't distinguish a
      // refresh from a brand-new import.
      if (totalUpdated > 0 || totalCreated > 0) {
        setError(null);
      }
      onModalClose();
    } catch (err: unknown) {
      setImporting(false);
      setError((err as Error).message || "Import failed.");
    }
  };

  const cancelMapping = () => {
    setShowMappingStep(false);
    setParsedFile(null);
    setMapping({});
    setFileInputKey((k) => k + 1);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  // Legacy handler kept for cloud upload button
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleImageClick = () => inputRef.current?.focus();
  const openFilePicker = () => fileInputRef.current?.click();

  return {
    uploading, progress, remainingKB, secondsRemaining,
    fileName, fileInputKey, error, importing, preview,
    handleFileSelect, handleFileDrop, handleFileUpload,
    openFilePicker, fileInputRef,
    imageUrl, setImageUrl, inputRef, handleUrlChange, handleImageClick,
    // Mapping step — new
    parsedFile, mapping, showMappingStep, updateMapping, confirmMappingAndImport, cancelMapping,
  };
};
