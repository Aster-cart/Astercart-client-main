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
  isActive?: boolean;
  images?: string[];
}

const ProductsAD: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ products?: Product[] } | Product[]>(
        "/store/get-all-products-admin"
      );
      const list = Array.isArray(data) ? data : (data as { products?: Product[] }).products || [];
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFlag = async (id: string, isFlagged: boolean) => {
    setActionId(id);
    try {
      await api.put(`/store/flag-product/${id}`, { isFlagged: !isFlagged });
      toast.success(isFlagged ? "Product unflagged" : "Product flagged");
      load();
    } catch {
      toast.error("Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Remove this product from the marketplace?")) return;
    setActionId(id);
    try {
      await api.delete(`/store/delete-product/${id}`);
      toast.success("Product removed");
      load();
    } catch {
      toast.error("Failed to remove product.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      search === "" ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.storeName?.toLowerCase().includes(search.toLowerCase())
  );

  const flagged = products.filter((p) => p.isFlagged).length;
  const outOfStock = products.filter(
    (p) => Number(p.quantity ?? p.qty ?? 0) === 0
  ).length;

  if (loading) return <p className="p-4 text-gray-500">Loading products...</p>;

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total products", value: products.length },
          { label: "Flagged", value: flagged, color: "text-red-500" },
          { label: "Out of stock", value: outOfStock, color: "text-yellow-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${(s as { color?: string }).color || ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by product name, category, or store..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-96 focus:outline-none focus:border-pry"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">
            No products found.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="px-4">Category</th>
                <th className="px-4">Store</th>
                <th className="px-4">Price</th>
                <th className="px-4">Stock</th>
                <th className="px-4">Status</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const price = p.adminPrice ?? p.price ?? 0;
                const qty = Number(p.quantity ?? p.qty ?? 0);
                return (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100" />
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 text-gray-500">{p.category}</td>
                    <td className="px-4 text-gray-500">{p.storeName || "—"}</td>
                    <td className="px-4">
                      ₦{new Intl.NumberFormat("en-NG").format(price)}
                    </td>
                    <td className="px-4">{qty}</td>
                    <td className="px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.isFlagged
                            ? "bg-red-100 text-red-600"
                            : qty === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.isFlagged ? "Flagged" : qty === 0 ? "Out of stock" : "Active"}
                      </span>
                    </td>
                    <td className="px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFlag(p._id, !!p.isFlagged)}
                          disabled={actionId === p._id}
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            p.isFlagged
                              ? "bg-blue-100 text-blue-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
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
    </div>
  );
};

export default ProductsAD;
