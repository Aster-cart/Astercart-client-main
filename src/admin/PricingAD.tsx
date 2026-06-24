import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface PricingProduct {
  _id: string;
  name: string;
  storeName: string;
  images?: string[];
  storePrice: number;
  customerPrice: number;
  markupRevenue: number;
  markupType: "percent" | "flat" | "none";
  markupValue: number;
  markdownType: "percent" | "flat" | "none";
  markdownValue: number;
  markdownExpiresAt?: string | null;
  markdownExpired?: boolean;
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const PricingAD: React.FC = () => {
  const [products, setProducts] = useState<PricingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<PricingProduct | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ products: PricingProduct[] }>("/store/admin/products/pricing-overview");
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load pricing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    !search.trim() ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.storeName.toLowerCase().includes(search.toLowerCase())
  );

  const totalMarkupRevenue = products.reduce((s, p) => s + (p.markupRevenue || 0), 0);
  const markedUpCount = products.filter(p => p.markupType !== "none").length;
  const markedDownCount = products.filter(p => p.markdownType !== "none").length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p._id)));
    }
  };

  return (
    <div className="font-inter">
      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
        <strong>Markup</strong> is set individually per product — there is no single global rate. Each
        product can have a different markup (or none). The markup amount belongs to the platform; it's
        added on top of the store's own price. <strong>Markdown</strong> works the same way for
        promotions/bonanzas, and can have an expiry date.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total markup revenue (estimate)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatNaira(totalMarkupRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Products marked up</p>
          <p className="text-2xl font-bold mt-1">{markedUpCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Products on markdown</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{markedDownCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total products</p>
          <p className="text-2xl font-bold mt-1">{products.length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search products or stores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:border-pry"
        />
        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowBatchModal(true)}
            className="text-sm px-4 py-2 bg-pry text-white rounded-lg font-medium"
          >
            Apply markup/markdown to {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No products found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs bg-gray-50">
              <tr>
                <th className="py-3 px-4">
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={selectAll} />
                </th>
                <th className="px-4">Product</th>
                <th className="px-4">Store</th>
                <th className="px-4">Store price</th>
                <th className="px-4">Markup</th>
                <th className="px-4">Markdown</th>
                <th className="px-4">Customer pays</th>
                <th className="px-4">Markup revenue</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={selectedIds.has(p._id)} onChange={() => toggleSelect(p._id)} />
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                        : <div className="w-8 h-8 rounded bg-gray-100" />
                      }
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 text-gray-500">{p.storeName}</td>
                  <td className="px-4">{formatNaira(p.storePrice)}</td>
                  <td className="px-4">
                    {p.markupType === "none" ? (
                      <span className="text-gray-400 text-xs">None</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        +{p.markupValue}{p.markupType === "percent" ? "%" : " ₦"}
                      </span>
                    )}
                  </td>
                  <td className="px-4">
                    {p.markdownType === "none" ? (
                      <span className="text-gray-400 text-xs">{p.markdownExpired ? "Expired" : "None"}</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        -{p.markdownValue}{p.markdownType === "percent" ? "%" : " ₦"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 font-bold">{formatNaira(p.customerPrice)}</td>
                  <td className="px-4 text-green-600">{formatNaira(p.markupRevenue)}</td>
                  <td className="px-4">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Individual edit modal */}
      {editingProduct && (
        <PricingEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { setEditingProduct(null); load(); }}
        />
      )}

      {/* Batch edit modal */}
      {showBatchModal && (
        <BatchPricingModal
          count={selectedIds.size}
          productIds={Array.from(selectedIds)}
          onClose={() => setShowBatchModal(false)}
          onSaved={() => { setShowBatchModal(false); setSelectedIds(new Set()); load(); }}
        />
      )}
    </div>
  );
};

// ─── Individual product pricing edit modal ───────────────────────────────────
const PricingEditModal: React.FC<{
  product: PricingProduct;
  onClose: () => void;
  onSaved: () => void;
}> = ({ product, onClose, onSaved }) => {
  const [markupType, setMarkupType] = useState(product.markupType);
  const [markupValue, setMarkupValue] = useState(product.markupValue);
  const [markdownType, setMarkdownType] = useState(product.markdownType);
  const [markdownValue, setMarkdownValue] = useState(product.markdownValue);
  const [markdownExpiresAt, setMarkdownExpiresAt] = useState(
    product.markdownExpiresAt ? product.markdownExpiresAt.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/store/admin/products/${product._id}/markup`, {
        markupType, markupValue,
        markdownType, markdownValue,
        markdownExpiresAt: markdownExpiresAt || null,
      });
      toast.success("Pricing updated.");
      onSaved();
    } catch {
      toast.error("Failed to update pricing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-4">Store price: {formatNaira(product.storePrice)}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Markup type</label>
            <select
              value={markupType}
              onChange={(e) => setMarkupType(e.target.value as any)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
            >
              <option value="none">No markup</option>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat amount (₦)</option>
            </select>
          </div>
          {markupType !== "none" && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Markup value {markupType === "percent" ? "(%)" : "(₦)"}
              </label>
              <input
                type="number" min={0}
                value={markupValue}
                onChange={(e) => setMarkupValue(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
              />
            </div>
          )}

          <div className="border-t pt-4">
            <label className="text-xs text-gray-500 font-medium block mb-1">Markdown type (bonanza/sale)</label>
            <select
              value={markdownType}
              onChange={(e) => setMarkdownType(e.target.value as any)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
            >
              <option value="none">No markdown</option>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat amount (₦)</option>
            </select>
          </div>
          {markdownType !== "none" && (
            <>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  Markdown value {markdownType === "percent" ? "(%)" : "(₦)"}
                </label>
                <input
                  type="number" min={0}
                  value={markdownValue}
                  onChange={(e) => setMarkdownValue(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Expires on (optional)</label>
                <input
                  type="date"
                  value={markdownExpiresAt}
                  onChange={(e) => setMarkdownExpiresAt(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
                <p className="text-xs text-gray-400 mt-1">After this date, the markdown stops applying automatically.</p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Batch pricing modal ──────────────────────────────────────────────────────
const BatchPricingModal: React.FC<{
  count: number;
  productIds: string[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ count, productIds, onClose, onSaved }) => {
  const [mode, setMode] = useState<"markup" | "markdown">("markup");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  const handleApply = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { productIds };
      if (mode === "markup") {
        body.markupType = type;
        body.markupValue = value;
      } else {
        body.markdownType = type;
        body.markdownValue = value;
        body.markdownExpiresAt = expiresAt || null;
      }
      const { data } = await api.put("/store/admin/products/batch-markup", body);
      toast.success(data?.message || "Batch update applied.");
      onSaved();
    } catch {
      toast.error("Failed to apply batch update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="font-semibold text-lg mb-1">Batch update {count} products</h3>
        <p className="text-sm text-gray-400 mb-4">
          This applies the same rate to every selected product right now — it's a one-time
          bulk edit, not a live rule. Each product can still be individually adjusted afterward.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("markup")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${mode === "markup" ? "bg-pry text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Markup
            </button>
            <button
              onClick={() => setMode("markdown")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${mode === "markdown" ? "bg-pry text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Markdown (sale)
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
            >
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat amount (₦)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">
              Value {type === "percent" ? "(%)" : "(₦)"}
            </label>
            <input
              type="number" min={0}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
            />
          </div>

          {mode === "markdown" && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Expires on (optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleApply} disabled={saving} className="flex-1 px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {saving ? "Applying..." : `Apply to ${count} products`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingAD;
