import React from "react";
import { cloud, upload } from "../assets/res";
import { useInventoryModal, ASTERCART_FIELDS } from "../hooks/useInventoryModal";

type ImportModalProps = {
  onClose: () => void;
  onImport: (data: unknown[]) => void;
};

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const {
    uploading, progress, remainingKB, secondsRemaining,
    fileName, fileInputKey, error, importing, preview,
    handleFileSelect, handleFileDrop, handleFileUpload,
    openFilePicker, fileInputRef,
    parsedFile, mapping, showMappingStep, updateMapping, confirmMappingAndImport, cancelMapping,
  } = useInventoryModal(onClose, onImport);

  // ── Mapping step ──────────────────────────────────────────────────────
  // Shown once a file has been read successfully, BEFORE anything is
  // actually imported. This is the real fix for "our store's CSV export
  // doesn't use your exact column names" — the store sees their own
  // real headers and tells the system what each one means, instead of
  // being forced to retype everything into Astercart's fixed template.
  if (showMappingStep && parsedFile) {
    const sampleRow = parsedFile.rows[0] || [];
    return (
      <div className="fixed font-inter inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-[44vw] max-h-[85vh] overflow-y-auto relative">
          <button
            onClick={cancelMapping}
            className="absolute top-2 right-2 bg-gray-100 p-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>

          <p className="text-xl leading-6 font-semibold mb-1">Match your columns</p>
          <p className="text-xs text-gray-500 mb-4">
            We found {parsedFile.headers.length} columns in <strong>{fileName}</strong>. We've guessed what
            each one means — check them below and correct anything that's wrong before importing.
          </p>

          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left py-2 px-3">Your column</th>
                  <th className="text-left py-2 px-3">Sample value</th>
                  <th className="text-left py-2 px-3">Maps to</th>
                </tr>
              </thead>
              <tbody>
                {parsedFile.headers.map((header, i) => (
                  <tr key={header} className="border-t">
                    <td className="py-2 px-3 font-medium">{header}</td>
                    <td className="py-2 px-3 text-gray-400 truncate max-w-[140px]">
                      {String(sampleRow[i] ?? "—")}
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={mapping[header] || ""}
                        onChange={(e) => updateMapping(header, e.target.value as any)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:border-pry"
                      >
                        <option value="">— Don't import this column —</option>
                        {ASTERCART_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}{f.required ? " (required)" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p className="text-xs text-blue-700">
              <strong>Have a Barcode column?</strong> Map it to "Barcode" — products matched by barcode will
              have their price and stock updated automatically next time you upload, instead of creating
              duplicates. Products without a barcode are always created as new.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Have an Image URL column?</strong> Map it to "Image URL" — each link will be fetched and
              saved as a real product photo automatically. Imports with images take a bit longer per product
              since each one is uploaded individually.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelMapping}
              className="px-4 py-2 text-sm text-gray-500 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={confirmMappingAndImport}
              className="px-5 py-2 bg-pry text-white rounded-lg text-sm font-medium"
            >
              Import products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed font-inter inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[34vw] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-100 p-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        >
          ✕
        </button>

        <p className="text-xl leading-6 font-semibold mb-1">Import Products</p>
        <p className="text-xs text-gray-500 mb-4">
          Upload a CSV or Excel file — your own export from any system works. You'll be able to match your
          columns to Astercart's fields on the next step, including an optional Barcode column.
        </p>

        {/* Download template link — still here, unchanged, for stores
            with no existing export who want a clean starting point. */}
        <a
          href="data:text/csv;charset=utf-8,name,price,quantity,category,barcode,description,discount\nExample Product,1500,50,Food,,A sample product,0"
          download="astercart_product_template.csv"
          className="text-xs text-pry underline mb-4 block"
        >
          Download template CSV
        </a>

        {/* Drop zone */}
        <div
          className={`border-dashed rounded-lg border-2 border-gray-300 p-6 text-center mb-4 h-32 flex flex-col justify-center items-center ${
            uploading ? "bg-orange-50" : ""
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          {!uploading && !importing && (
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
              <img src={upload} alt="Upload" className="mb-3 w-8" />
              <p className="text-xs font-medium pb-1">
                Drop your file here or <span className="text-pry">browse</span>
              </p>
              <p className="text-xs text-gray-400">Supported: CSV, XLS, XLSX</p>
            </label>
          )}

          <input
            key={fileInputKey}
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileSelect}
            accept=".csv,.xls,.xlsx"
          />

          {uploading && (
            <div className="w-full">
              <p className="text-sm mb-2 font-medium truncate">{fileName}</p>
              <div className="relative w-full bg-gray-100 rounded h-2 mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500 rounded transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {remainingKB} KB remaining · {secondsRemaining}s left
              </p>
            </div>
          )}

          {importing && (
            <div className="w-full text-center">
              <div className="animate-spin w-6 h-6 border-2 border-pry border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-2">Uploading in batches…</p>
              <div className="relative w-full bg-gray-100 rounded h-2">
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500 rounded transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Preview (first 3 rows):</p>
            <div className="text-xs text-gray-500 space-y-1">
              {preview.map((p, i) => (
                <div key={i} className="flex gap-2 bg-gray-50 rounded px-2 py-1">
                  <span className="flex-1 truncate font-medium">{String(p.name)}</span>
                  <span>₦{String(p.price)}</span>
                  <span className="text-gray-400">{String(p.quantity)} pcs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cloud upload */}
        <div className="border-dashed rounded-lg border-2 border-gray-300 p-4 text-center flex flex-col justify-center items-center cursor-pointer"
          onClick={openFilePicker}
        >
          <img src={cloud} alt="Upload from Cloud" className="mb-2 w-8" />
          <p className="text-xs font-medium">Upload from device</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".csv,.xls,.xlsx"
          />
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
