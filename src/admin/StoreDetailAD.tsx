import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface StoreDetail {
  store: {
    _id: string;
    name: string;
    email: string;
    status: string;
    picture?: string;
    storeDetails?: { address?: string; state?: string; lga?: string };
    createdAt: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalStorePayout: number;
    platformFee: number;
    outOfStock: number;
    lowStock: number;
  };
}

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  adminPrice: number;
  quantity: number;
  isFlagged: boolean;
  images?: string[];
}

interface Order {
  _id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  products: { name: string; quantity: number; price: number }[];
}

type Tab = "overview" | "products" | "orders";

interface Props {
  storeId: string;
  onBack: () => void;
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);


// ─── Per-store fee override component ───────────────────────────────────────
const PerStoreFeeOverride: React.FC<{ storeId: string; storeName: string }> = ({ storeId, storeName }) => {
  const [commission, setCommission] = useState<number | "">("");
  const [deliveryFee, setDeliveryFee] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (commission === "" && deliveryFee === "") return;
    setSaving(true);
    try {
      await api.put(`/store/adminstore/${storeId}/fee-config`, {
        platformCommission: commission === "" ? undefined : Number(commission),
        deliveryFee: deliveryFee === "" ? undefined : Number(deliveryFee),
      });
      toast.success(`Fee override saved for ${storeName}`);
    } catch {
      toast.error("Failed to save. The fee-config endpoint needs to be added to the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border">
      <h3 className="font-semibold mb-1">Custom fee override for this store</h3>
      <p className="text-xs text-gray-400 mb-4">
        Leave blank to use the global platform defaults. Set a value to override for this store only.
      </p>
      <div className="flex gap-4 items-end flex-wrap">
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Platform commission (%)</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <input
              type="number" min={0} max={100} placeholder="e.g. 8"
              value={commission}
              onChange={(e) => setCommission(e.target.value === "" ? "" : Number(e.target.value))}
              className="px-3 py-2 text-sm focus:outline-none w-28"
            />
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Delivery fee (₦)</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <input
              type="number" min={0} placeholder="e.g. 500"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value === "" ? "" : Number(e.target.value))}
              className="px-3 py-2 text-sm focus:outline-none w-28"
            />
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l">₦</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-pry text-white rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save override"}
        </button>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const StoreDetailAD: React.FC<Props> = ({ storeId, onBack }) => {
  const [detail, setDetail] = useState<StoreDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load store overview on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<StoreDetail>(`/store/adminstore/${storeId}`);
        setDetail(data);
      } catch {
        toast.error("Failed to load store details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  // Load products when tab switches to products
  useEffect(() => {
    if (tab !== "products" || products.length > 0) return;
    (async () => {
      setLoadingProducts(true);
      try {
        const { data } = await api.get<Product[] | { products: Product[] }>(
          `/store/get-all-products-admin?storeId=${storeId}`
        );
        const list = Array.isArray(data) ? data : (data as { products: Product[] }).products || [];
        // Filter to this store only
        setProducts(list.filter((p: any) => p.storeId?.toString() === storeId || !p.storeId));
      } catch {
        toast.error("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [tab, storeId]);

  // Load orders when tab switches to orders
  useEffect(() => {
    if (tab !== "orders" || orders.length > 0) return;
    (async () => {
      setLoadingOrders(true);
      try {
        const { data } = await api.get<{ orders: Order[] }>(
          `/store/adminstore/${storeId}/orders`
        );
        setOrders(data.orders || []);
      } catch {
        toast.error("Failed to load orders.");
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, [tab, storeId]);

  if (loading) return <p className="p-8 text-gray-500">Loading store…</p>;
  if (!detail) return <p className="p-8 text-red-500">Store not found.</p>;

  const { store, stats } = detail;

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    inactive: "bg-red-100 text-red-600",
  };

  return (
    <div className="font-inter">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        ← Back to stores
      </button>

      {/* Store header */}
      <div className="bg-white rounded-xl p-6 border mb-6 flex items-start gap-4">
        {store.picture ? (
          <img src={store.picture} alt="" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-pry flex items-center justify-center text-white text-2xl font-bold">
            {store.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold">{store.name}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[store.status] || "bg-gray-100"}`}>
              {store.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{store.email}</p>
          {store.storeDetails?.address && (
            <p className="text-sm text-gray-400 mt-1">
              {store.storeDetails.address}, {store.storeDetails.lga}, {store.storeDetails.state}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Joined {new Date(store.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total products", value: stats.totalProducts },
          { label: "Total orders", value: stats.totalOrders },
          { label: "Gross revenue", value: formatNaira(stats.totalRevenue) },
          { label: "Store payout", value: formatNaira(stats.totalStorePayout) },
          { label: "Platform fee", value: formatNaira(stats.platformFee) },
          { label: "Out of stock", value: stats.outOfStock, color: "text-red-500" },
          { label: "Low stock", value: stats.lowStock, color: "text-yellow-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${(s as { color?: string }).color || ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["overview", "products", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              tab === t ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold mb-4">Revenue breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gross revenue (customer paid)</span>
              <span className="font-medium">{formatNaira(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Store payout (90%)</span>
              <span className="font-medium text-green-600">{formatNaira(stats.totalStorePayout)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-gray-500">Platform fee (10%)</span>
              <span className="font-medium text-blue-600">{formatNaira(stats.platformFee)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Products tab */}
      {tab === "products" && (
        <div className="bg-white rounded-xl border overflow-x-auto">
          {loadingProducts ? (
            <p className="p-6 text-gray-500">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-gray-400">No products found for this store.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b text-xs">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="px-4">Category</th>
                  <th className="px-4">Price</th>
                  <th className="px-4">Stock</th>
                  <th className="px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const qty = Number(p.quantity ?? 0);
                  const stockStatus = qty === 0 ? "Out of stock" : qty < 10 ? "Low stock" : "In stock";
                  const stockColor = qty === 0
                    ? "bg-red-100 text-red-600"
                    : qty < 10
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700";
                  return (
                    <tr key={p._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100" />
                          )}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 text-gray-500">{p.category}</td>
                      <td className="px-4">₦{new Intl.NumberFormat("en-NG").format(p.adminPrice || p.price)}</td>
                      <td className="px-4">{qty}</td>
                      <td className="px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockColor}`}>
                          {p.isFlagged ? "Flagged" : stockStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="bg-white rounded-xl border overflow-x-auto">
          {loadingOrders ? (
            <p className="p-6 text-gray-500">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="p-6 text-gray-400">No orders for this store yet.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b text-xs">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="px-4">Items</th>
                  <th className="px-4">Amount</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Payment</th>
                  <th className="px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{o.customerName}</td>
                    <td className="px-4 text-gray-500 text-xs">
                      {o.products.slice(0, 2).map((p) => p.name).join(", ")}
                      {o.products.length > 2 && ` +${o.products.length - 2} more`}
                    </td>
                    <td className="px-4">{formatNaira(o.totalAmount)}</td>
                    <td className="px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreDetailAD;
