import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

type AdminOrder = {
  _id: string;
  customerName: string;
  storeName: string;
  totalAmount: number;        // product subtotal only
  deliveryFee?: number;
  serviceFee?: number;
  platformCommission?: number;
  storePayout?: number;
  grandTotal?: number;
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
  canceled: "bg-gray-100 text-body",
  failed: "bg-red-100 text-red-600",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-yellow-100 text-yellow-700",
  refunded: "bg-red-100 text-red-600",
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

// Rich single-order detail returned by GET /adminOrder/:id/detail — used for
// the dispute-resolution view (rider, timeline, distance, route, payment).
type OrderDetail = {
  order: { _id: string; status: string; paymentStatus: string; createdAt: string; deliveredAt: string | null; estimatedDelivery: string | null; deliveryLocationFlagged: boolean };
  customer: { name: string; email: string; phoneNumber: string };
  store: { name: string; phoneNumber: string; email: string };
  rider: null | {
    name: string; phoneNumber: string; email: string; rating?: number; totalDeliveries?: number;
    verificationStatus: string;
    vehicle: { vehicleType: string | null; vehicleModel: string | null; numberPlate: string | null };
  };
  products: { name: string; quantity: number; price: number; total?: number }[];
  delivery: { address: string; state: string; lga: string; distanceKm: number | null; durationMs: number | null; pickupVerifiedAt: string | null; deliveryVerifiedAt: string | null };
  route: {
    store: { latitude: number; longitude: number } | null;
    delivery: { latitude: number; longitude: number } | null;
    riderLastKnown: { latitude: number; longitude: number; updatedAt?: string } | null;
  };
  payment: {
    flutterwaveTxId: string | null; customerProductTotal: number; deliveryFee: number; serviceFee: number;
    grandTotal: number; storePayout: number; riderPayout: number; platformCommission: number;
    settlementStatus: string; settlementDate: string | null; refundAmount: number; refundedAt: string | null; refundReason: string | null;
  };
  timeline: { at: string; label: string; meta?: string }[];
};

const fmtDateTime = (s?: string | null) =>
  s ? new Date(s).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const fmtDuration = (ms: number | null) => {
  if (ms == null || ms < 0) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
};

const OrdersAD: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const openOrder = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setDetail(null);
    setDetailLoading(true);
    try {
      const { data } = await api.get<OrderDetail>(`/adminOrder/${order._id}/detail`);
      setDetail(data);
    } catch (error: any) {
      // Non-fatal — the basic view (from the list row) still renders even if
      // the rich detail endpoint fails, so the admin is never left stranded.
      console.error("[OrdersAD] detail fetch failed:", error?.response?.status, error?.response?.data || error?.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefund = async (order: AdminOrder) => {
    if (!window.confirm(`Issue a refund for order #${(order._id || "").slice(-8).toUpperCase()}? This will refund the customer via Flutterwave.`)) {
      return;
    }
    setRefunding(true);
    try {
      const { data } = await api.post(`/payment/refund/${order._id}`, {
        reason: "Refund issued by admin from Orders page",
      });
      toast.success(data?.message || "Refund processed.");
      setSelectedOrder(null);
      // Refresh the order list so the refunded order's status updates
      // without needing a manual page reload.
      const refreshed = await api.get<AdminOrder[]>("/adminOrder");
      setOrders(Array.isArray(refreshed.data) ? refreshed.data : []);
    } catch (error: any) {
      // The refund endpoint can return a 409 specifically when this
      // customer has had 3+ refunds in the last 14 days (the velocity
      // check built earlier) — that response includes requiresOverride,
      // letting admin explicitly confirm and proceed anyway rather than
      // being silently blocked with no path forward.
      if (error?.response?.status === 409 && error?.response?.data?.requiresOverride) {
        const proceed = window.confirm(
          `${error.response.data.message}\n\nProceed with the refund anyway?`
        );
        if (proceed) {
          try {
            const { data } = await api.post(`/payment/refund/${order._id}`, {
              reason: "Refund issued by admin from Orders page (override)",
              overrideFraudFlag: true,
            });
            toast.success(data?.message || "Refund processed.");
            setSelectedOrder(null);
            const refreshed = await api.get<AdminOrder[]>("/adminOrder");
            setOrders(Array.isArray(refreshed.data) ? refreshed.data : []);
          } catch {
            toast.error("Refund failed even with override. Please check Flutterwave directly.");
          }
        }
      } else {
        toast.error(error?.response?.data?.message || "Failed to process refund.");
      }
    } finally {
      setRefunding(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<AdminOrder[]>("/adminOrder");
        setOrders(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error("[OrdersAD] Failed to load orders:", error?.response?.status, error?.response?.data || error?.message);
        const status = error?.response?.status;
        if (status === 403) {
          toast.error(error?.response?.data?.message || "Your admin role does not have permission to view orders.");
        } else if (status === 401) {
          toast.error("Your session has expired. Please log in again.");
        } else {
          toast.error("Failed to load orders. Check your connection and try again.");
        }
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

  if (loading) return <p className="p-4 text-muted">Loading orders...</p>;

  // Order detail view
  if (selectedOrder) {
    return (
      <div className="font-inter">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => { setSelectedOrder(null); setDetail(null); }}
            className="flex items-center gap-2 text-sm text-muted hover:text-ink"
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
                Order #{(selectedOrder._id || "").slice(-8).toUpperCase() || "—"}
              </h2>
              <p className="text-sm text-muted">
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder.status] || "bg-gray-100 text-body"}`}>
                {(selectedOrder.status || "unknown").replace(/_/g, " ")}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[selectedOrder.paymentStatus] || "bg-gray-100"}`}>
                {selectedOrder.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted mb-1">Customer</p>
              <p className="font-medium">{selectedOrder.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Store</p>
              <p className="font-medium">{selectedOrder.storeName}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Delivery address</p>
              <p className="font-medium">{selectedOrder.address || "—"}</p>
              <p className="text-sm text-muted">{selectedOrder.state}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Financial breakdown</p>
              {/* Every figure below is read directly from the transaction's
                  real, already-calculated fields — never recomputed here.
                  Previously this guessed a flat 5% service fee, a flat ₦800
                  delivery fee, and a flat 90% store payout regardless of
                  what was actually charged or any per-store fee override,
                  which is exactly what made this page disagree with the
                  store's own dashboard for the same order. */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Product subtotal</span>
                  <span>{formatNaira(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Service fee</span>
                  <span>{formatNaira(selectedOrder.serviceFee || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Delivery fee</span>
                  <span>{formatNaira(selectedOrder.deliveryFee || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-1">
                  <span>Grand total (customer paid)</span>
                  <span className="text-pry">{formatNaira(selectedOrder.grandTotal || selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-green-600">
                  <span>Store payout</span>
                  <span>{formatNaira(selectedOrder.storePayout != null ? selectedOrder.storePayout : selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-purple-600">
                  <span>Platform commission</span>
                  <span>{formatNaira(selectedOrder.platformCommission || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {detailLoading && (
          <div className="bg-white rounded-xl p-6 border mb-4 text-sm text-muted">
            Loading full order detail…
          </div>
        )}

        {detail && (
          <div className="bg-white rounded-xl p-6 border mb-4">
            <h3 className="font-semibold mb-4">Dispute resolution detail</h3>

            {detail.order.deliveryLocationFlagged && (
              <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠ This delivery was flagged — the rider confirmed delivery more than 5km from the delivery address.
              </div>
            )}

            {/* Customer → Store → Rider */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted mb-1">Customer</p>
                <p className="font-medium text-sm">{detail.customer.name}</p>
                <p className="text-xs text-muted">{detail.customer.phoneNumber || "No phone"}</p>
                <p className="text-xs text-muted">{detail.customer.email}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted mb-1">Store</p>
                <p className="font-medium text-sm">{detail.store.name}</p>
                <p className="text-xs text-muted">{detail.store.phoneNumber || "No phone"}</p>
                <p className="text-xs text-muted">{detail.store.email || ""}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted mb-1">Assigned rider</p>
                {detail.rider ? (
                  <>
                    <p className="font-medium text-sm">{detail.rider.name}</p>
                    <p className="text-xs text-muted">{detail.rider.phoneNumber || "No phone"}</p>
                    <p className="text-xs text-muted">
                      {detail.rider.vehicle.vehicleType || "—"}
                      {detail.rider.vehicle.numberPlate ? ` · ${detail.rider.vehicle.numberPlate}` : ""}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      ⭐ {detail.rider.rating?.toFixed?.(1) ?? "—"} · {detail.rider.totalDeliveries ?? 0} deliveries · {detail.rider.verificationStatus}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted">No rider assigned yet</p>
                )}
              </div>
            </div>

            {/* Pickup / delivery / distance / duration */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted mb-1">Pickup verified</p>
                <p className="text-sm font-medium">{fmtDateTime(detail.delivery.pickupVerifiedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Delivered</p>
                <p className="text-sm font-medium">{fmtDateTime(detail.order.deliveredAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Distance at delivery</p>
                <p className="text-sm font-medium">{detail.delivery.distanceKm != null ? `${detail.delivery.distanceKm} km` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Delivery duration</p>
                <p className="text-sm font-medium">{fmtDuration(detail.delivery.durationMs)}</p>
              </div>
            </div>

            {/* Route */}
            <div className="mb-6">
              <p className="text-xs text-muted mb-2">Route</p>
              <div className="grid grid-cols-3 gap-4 text-xs">
                {([
                  ["Store", detail.route.store],
                  ["Delivery address", detail.route.delivery],
                  ["Rider last known", detail.route.riderLastKnown],
                ] as const).map(([label, pt]) => (
                  <div key={label} className="border rounded-lg p-3">
                    <p className="text-muted mb-1">{label}</p>
                    {pt ? (
                      <a
                        className="text-pry underline"
                        href={`https://www.google.com/maps?q=${pt.latitude},${pt.longitude}`}
                        target="_blank" rel="noreferrer"
                      >
                        {pt.latitude.toFixed(5)}, {pt.longitude.toFixed(5)}
                      </a>
                    ) : (
                      <span className="text-muted">Not captured</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="mb-6">
              <p className="text-xs text-muted mb-2">Payment</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted">Payment reference</span><span className="font-mono text-xs">{detail.payment.flutterwaveTxId || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted">Settlement</span><span>{detail.payment.settlementStatus}{detail.payment.settlementDate ? ` · ${fmtDateTime(detail.payment.settlementDate)}` : ""}</span></div>
                <div className="flex justify-between"><span className="text-muted">Rider payout</span><span>{formatNaira(detail.payment.riderPayout)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Store payout</span><span>{formatNaira(detail.payment.storePayout)}</span></div>
                {detail.payment.refundedAt && (
                  <div className="flex justify-between text-red-600 col-span-2">
                    <span>Refunded {formatNaira(detail.payment.refundAmount)} on {fmtDateTime(detail.payment.refundedAt)}</span>
                    <span className="text-xs">{detail.payment.refundReason || ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-xs text-muted mb-2">Timeline</p>
              <ol className="border-l-2 border-gray-100 ml-2">
                {detail.timeline.length === 0 ? (
                  <li className="ml-4 text-sm text-muted">No events recorded.</li>
                ) : detail.timeline.map((ev, i) => (
                  <li key={i} className="ml-4 mb-3 relative">
                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-pry border-2 border-white" />
                    <p className="text-sm font-medium">{ev.label}{ev.meta ? <span className="text-muted font-normal"> — {ev.meta}</span> : null}</p>
                    <p className="text-xs text-muted">{fmtDateTime(ev.at)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold mb-4">Order items</h3>
          <table className="w-full text-sm">
            <thead className="text-muted border-b text-xs">
              <tr>
                <th className="py-2 text-left">Product</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Unit price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(selectedOrder.products || []).map((p, i) => (
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
            <p className="text-xs text-muted">{s.label}</p>
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
          className="border border-border rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-pry"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
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
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All stores</option>
          {storeNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
        <p className="text-sm text-muted my-auto">
          {filtered.length} of {orders.length} orders
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">No orders found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-muted border-b text-xs">
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
                <tr key={o._id} className="border-b hover:bg-off-white">
                  <td className="py-3 px-4 font-mono text-xs">
                    #{o._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4">{o.customerName}</td>
                  <td className="px-4 text-muted">{o.storeName}</td>
                  <td className="px-4 font-medium">{formatNaira(o.totalAmount)}</td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || "bg-gray-100 text-body"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[o.paymentStatus] || "bg-gray-100"}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 text-muted text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4">
                    <button
                      onClick={() => openOrder(o)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-body rounded-lg font-medium hover:bg-gray-200"
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
