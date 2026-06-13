import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  category: string;
  price?: number;
  adminPrice?: number;
  quantity?: number;
  qty?: number;
  storeName?: string;
  storeId?: string;
  isFlagged?: boolean;
  images?: string[];
}

type StoreGroup = {
  storeName: string;
  storeId: string;
  products: Product[];
  expanded: boolean;
};

const ProductsAD: React.FC = () => {
  const [storeGroups, setStoreGroups] = useState<StoreGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ products?: Product[] } | Product[]>(
        "/store/get-all-products-admin"
      );
      const list: Product[] = Array.isArray(data) ? data : (data as { products?: Product[] }).products || [];

      // Group by store
      const groups: Record<string, StoreGroup> = {};
      list.forEach((p) => {
        const key = p.storeId || "unknown";
        const name = p.storeName || "Unknown Store";
        if (!groups[key]) {
          groups[key] = { storeName: name, storeId: key, products: [], expanded: true };
        }
        groups[key].products.push(p);
      });

      setStoreGroups(Object.values(groups));
    } catch {
      setStoreGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleGroup = (storeId: string) => {
    setStoreGroups(prev => prev.map(g =>
      g.storeId === storeId ? { ...g, expanded: !g.expanded } : g
    ));
  };

  const handleFlag = async (id: string, isFlagged: boolean) => {
    setActionId(id);
    try {
      await api.put(`/store/products/${id}/flag`);
      toast.success(isFlagged ? "Product unflagged" : "Product flagged");
      load();
    } catch { toast.error("Action failed."); }
    finally { setActionId(null); }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Remove this product from the marketplace?")) return;
    setActionId(id);
    try {
      await api.delete(`/store/delete-product/${id}`);
      toast.success("Product removed");
      load();
    } catch { toast.error("Failed to remove product."); }
    finally { setActionId(null); }
  };

  const totalProducts = storeGroups.reduce((s, g) => s + g.products.length, 0);
  const totalFlagged = storeGroups.reduce((s, g) => s + g.products.filter(p => p.isFlagged).length, 0);
  const totalOutOfStock = storeGroups.reduce((s, g) =>
    s + g.products.filter(p => Number(p.quantity ?? p.qty ?? 0) === 0).length, 0
  );

  // Filter groups by search
  const filteredGroups = storeGroups.map(g => ({
    ...g,
    products: search.trim()
      ? g.products.filter(p =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase())
        )
      : g.products,
  })).filter(g => !search.trim() || g.products.length > 0);

  if (loading) return <p className="p-4 text-gray-500">Loading products...</p>;

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total stores", value: storeGroups.length },
          { label: "Total products", value: totalProducts },
          { label: "Flagged", value: totalFlagged, color: "text-red-500" },
          { label: "Out of stock", value: totalOutOfStock, color: "text-yellow-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${(s as any).color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-96 focus:outline-none focus:border-pry"
        />
      </div>

      {/* Store groups */}
      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <div key={group.storeId} className="bg-white rounded-xl border overflow-hidden">
            {/* Store header */}
            <button
              onClick={() => toggleGroup(group.storeId)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pry flex items-center justify-center text-white font-bold">
                  {group.storeName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{group.storeName}</p>
                  <p className="text-xs text-gray-400">{group.products.length} products</p>
                </div>
              </div>
              <span className="text-gray-400 text-lg">{group.expanded ? "▲" : "▼"}</span>
            </button>

            {/* Products table */}
            {group.expanded && (
              <table className="w-full text-sm text-left border-t">
                <thead className="text-gray-400 bg-gray-50 text-xs">
                  <tr>
                    <th className="py-2 px-4">Product</th>
                    <th className="px-4">Category</th>
                    <th className="px-4">Price</th>
                    <th className="px-4">Stock</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.products.map((p) => {
                    const price = p.adminPrice ?? p.price ?? 0;
                    const qty = Number(p.quantity ?? p.qty ?? 0);
                    const stockStatus = qty === 0 ? "Out of stock" : qty < 10 ? "Low stock" : "In stock";
                    const stockColor = qty === 0 ? "bg-red-100 text-red-600" : qty < 10 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
                    return (
                      <tr key={p._id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                              : <div className="w-8 h-8 rounded bg-gray-100" />
                            }
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 text-gray-500">{p.category}</td>
                        <td className="px-4">₦{new Intl.NumberFormat("en-NG").format(price)}</td>
                        <td className="px-4">{qty}</td>
                        <td className="px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isFlagged ? "bg-red-100 text-red-600" : stockColor}`}>
                            {p.isFlagged ? "Flagged" : stockStatus}
                          </span>
                        </td>
                        <td className="px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFlag(p._id, !!p.isFlagged)}
                              disabled={actionId === p._id}
                              className={`text-xs px-2 py-1 rounded font-medium ${p.isFlagged ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {p.isFlagged ? "Unflag" : "Flag"}
                            </button>
                            <button
                              onClick={() => handleRemove(p._id)}
                              disabled={actionId === p._id}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))}
        {filteredGroups.length === 0 && (
          <p className="text-center text-gray-400 py-8">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsAD;
