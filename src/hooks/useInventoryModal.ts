/**
 * useInventoryModal.ts
 * Handles file parsing and bulk product import.
 * Supports CSV and Excel (.xlsx/.xls) files.
 * Parses products and sends them to the server directly.
 */
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import api from "../utils/api";

const REQUIRED_COLUMNS = ["name", "price", "quantity", "category"];

function normaliseHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapRow(headers: string[], row: unknown[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? "";
  });
  return obj;
}

function headerAlias(raw: string): string {
  const n = normaliseHeader(raw);
  const aliases: Record<string, string> = {
    productname: "name",
    product: "name",
    itemname: "name",
    item: "name",
    cost: "price",
    unitprice: "price",
    sellingprice: "price",
    stock: "quantity",
    qty: "quantity",
    stockqty: "quantity",
    cat: "category",
    type: "category",
    desc: "description",
    details: "description",
    discount: "discount",
    tax: "taxRate",
    taxrate: "taxRate",
  };
  return aliases[n] || n;
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File): Promise<Record<string, unknown>[]> => {
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

          const rawHeaders = rows[0] as string[];
          const headers = rawHeaders.map(headerAlias);

          const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
          if (missing.length > 0) {
            reject(
              new Error(
                `Missing required columns: ${missing.join(", ")}. Your file must have columns for name, price, quantity and category.`
              )
            );
            return;
          }

          const products = rows.slice(1)
            .map((row) => mapRow(headers, row))
            .filter((p) => p.name && p.price);

          resolve(products);
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
      const products = await parseFile(file);
      setPreview(products.slice(0, 3)); // Show preview of first 3 rows
      setUploading(false);

      // Send to server in batches of 50 to avoid 413 errors
      setImporting(true);
      const BATCH_SIZE = 50;
      const batches = [];
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        batches.push(products.slice(i, i + BATCH_SIZE));
      }

      let allImported: unknown[] = [];
      for (let b = 0; b < batches.length; b++) {
        setProgress(Math.round(((b + 1) / batches.length) * 100));
        const response = await api.post("/store/create-product", batches[b]);
        const imported = response.data?.products || batches[b];
        allImported = allImported.concat(imported);
      }

      onImport(allImported);
      onModalClose();
    } catch (err: unknown) {
      setUploading(false);
      setImporting(false);
      setError((err as Error).message || "Import failed.");
    } finally {
      setFileInputKey((k) => k + 1);
    }
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
  };
};
