/**
 * EditProductModal.tsx
 * Works for both manually added products and bulk-imported ones.
 * Calls the real update API on save.
 */
import React, { useState } from "react";
import { useProductStore } from "../store/productStore";

interface Product {
  _id: string;
  name: string;
  price: string | number;
  quantity: string | number;
  category: string;
  description?: string;
  discount?: string | number;
  taxRate?: string | number;
}

interface Props {
  product: Product;
  onClose: () => void;
}

const EditProductModal: React.FC<Props> = ({ product, onClose }) => {
  const { updateProduct } = useProductStore();
  const [form, setForm] = useState({ ...product });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.quantity || !form.category) {
      setError("Name, price, quantity and category are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProduct(product._id, {
        name: form.name,
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
        description: form.description,
        discount: Number(form.discount || 0),
        taxRate: Number(form.taxRate || 0),
      });
      onClose();
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: "Product name *", name: "name", type: "text" },
    { label: "Price (₦) *", name: "price", type: "number" },
    { label: "Quantity *", name: "quantity", type: "number" },
    { label: "Category *", name: "category", type: "text" },
    { label: "Description", name: "description", type: "textarea" },
    { label: "Discount (%)", name: "discount", type: "number" },
    { label: "Tax rate (%)", name: "taxRate", type: "number" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 font-inter">
      <div className="bg-white rounded-xl p-6 w-[36vw] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Product</h2>

        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="text-xs text-gray-500 font-medium mb-1 block">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={String((form as Record<string, unknown>)[field.name] ?? "")}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={String((form as Record<string, unknown>)[field.name] ?? "")}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-3">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-pry text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
