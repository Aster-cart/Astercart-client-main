import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

type AdminOrder = {
  _id: string;
  customerName: string;
  storeName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  address?: string;
  state?: string;
  products: { name: string; quantity: number; price: number; total?: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-600",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-yellow-100 text-yellow-700",
  refunded: "bg-red-100 text-red-600",
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

const OrdersAD: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<AdminOrder[]>("/adminOrder");
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      search === "" ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.storeName?.toLowerCase().includes(search.toLowerCase()) ||
      o._id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    const matchStore = storeFilter === "all" || o.storeName === storeFilter;
    const now = Date.now();
    const orderTime = new Date(o.createdAt).getTime();
    const matchDate =
      dateFilter === "all" ? true :
      dateFilter === "today" ? orderTime >= new Date().setHours(0,0,0,0) :
      dateFilter === "week" ? orderTime >= now - 7 * 24 * 60 * 60 * 1000 :
      dateFilter === "month" ? orderTime >= now - 30 * 24 * 60 * 60 * 1000 : true;
    return matchSearch && matchStatus && matchPayment && matchStore && matchDate;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => ["delivered", "completed"].includes(o.status)).length,
    paid: orders.filter((o) => o.paymentStatus === "paid").length,
  };

  const storeNames = Array.from(new Set(orders.map(o => o.storeName).filter(Boolean)));

  if (loading) return <p className="p-4 text-gray-500">Loading orders...</p>;

  // Order detail view
  if (selectedOrder) {
    return (
      <div className="font-inter">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setSelectedOrder(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
          >
            ← Back to orders
          </button>
          {selectedOrder.paymentStatus === "paid" && selectedOrder.status !== "delivered" && selectedOrder.status !== "completed" && (
            <button
              onClick={() => handleRefund(selectedOrder)}
              disabled={refunding}
              className="text-sm px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium"
            >
              {refunding ? "Processing..." : "Issue refund"}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold">
                Order #{selectedOrder._id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>
                {selectedOrder.status.replace(/_/g, " ")}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[selectedOrder.paymentStatus] || "bg-gray-100"}`}>
                {selectedOrder.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Customer</p>
              <p className="font-medium">{selectedOrder.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Store</p>
              <p className="font-medium">{selectedOrder.storeName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Delivery address</p>
              <p className="font-medium">{selectedOrder.address || "—"}</p>
              <p className="text-sm text-gray-500">{selectedOrder.state}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Financial breakdown</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order subtotal</span>
                  <span>{formatNaira(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service fee (5%)</span>
                  <span>{formatNaira(Math.round(selectedOrder.totalAmount * 0.05))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery fee</span>
                  <span>₦800</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-1">
                  <span>Grand total</span>
                  <span className="text-pry">{formatNaira(selectedOrder.totalAmount + Math.round(selectedOrder.totalAmount * 0.05) + 800)}</span>
                </div>
                <div className="flex justify-between text-xs text-green-600">
                  <span>Store payout (90%)</span>
                  <span>{formatNaira(Math.round(selectedOrder.totalAmount * 0.9))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold mb-4">Order items</h3>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-2 text-left">Product</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.products.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3">{p.name}</td>
                  <td className="text-right">{p.quantity}</td>
                  <td className="text-right">{formatNaira(p.price)}</td>
                  <td className="text-right font-medium">
                    {formatNaira(p.total || p.price * p.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 text-right font-semibold">Grand total</td>
                <td className="pt-3 text-right font-bold text-pry">
                  {formatNaira(selectedOrder.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total orders", value: stats.total },
          { label: "Pending", value: stats.pending, color: "text-yellow-600" },
          { label: "Processing", value: stats.processing, color: "text-blue-600" },
          { label: "Delivered", value: stats.delivered, color: "text-green-600" },
          { label: "Paid", value: stats.paid, color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${(s as { color?: string }).color || ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search customer, store, order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-pry"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All stores</option>
          {storeNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
        <p className="text-sm text-gray-400 my-auto">
          {filtered.length} of {orders.length} orders
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No orders found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="px-4">Customer</th>
                <th className="px-4">Store</th>
                <th className="px-4">Amount</th>
                <th className="px-4">Status</th>
                <th className="px-4">Payment</th>
                <th className="px-4">Date</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">
                    #{o._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4">{o.customerName}</td>
                  <td className="px-4 text-gray-500">{o.storeName}</td>
                  <td className="px-4 font-medium">{formatNaira(o.totalAmount)}</td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[o.paymentStatus] || "bg-gray-100"}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrdersAD;
