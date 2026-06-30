import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface PaymentRow {
  _id: string;
  orderId: string;
  name: string;
  amount: number;          // store's OWN price total — the base store commission is taken from
  storePayout: number;     // amount - adminFee. What the store actually receives.
  adminFee: number;        // commission of store's OWN price (amount) — never includes markup
  serviceFee?: number;     // % of customerProductTotal (after markup), paid BY the customer, kept entirely by platform
  deliveryFee?: number;    // total delivery fee paid by customer — now split between rider and Astercart
  deliveryCommission?: number; // Astercart's cut of deliveryFee — 4th revenue stream
  riderPayout?: number;         // what the rider actually earned on this delivery
  markupRevenue?: number;  // platform's cut from per-product markup — revenue stream #1
  customerProductTotal?: number; // what customer actually paid for products, after markup
  grandTotal?: number;     // customerProductTotal + deliveryFee + serviceFee — the actual total the customer was charged
  status: string;
  payoutStatus?: string;
  createdAt: string;
  store?: { name?: string };
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

const PaymentAD: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, totalRevenue: 0, totalStorePayout: 0, totalAdminFee: 0,
    totalServiceFee: 0, totalDeliveryFee: 0, totalDeliveryCommission: 0, totalMarkupRevenue: 0, totalGrandTotal: 0, pendingPayouts: 0,
  });
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending_payout" | "paid_out">("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaymentRow[]>("/payment/all");
      const list = Array.isArray(data) ? data : [];
      setPayments(list);
      setStats({
        total: list.length,
        totalRevenue: list.reduce((s, p) => s + (p.amount || 0), 0),
        totalStorePayout: list.reduce((s, p) => s + (p.storePayout || 0), 0),
        totalAdminFee: list.reduce((s, p) => s + (p.adminFee || 0), 0),
        totalServiceFee: list.reduce((s, p) => s + (p.serviceFee || 0), 0),
        totalDeliveryFee: list.reduce((s, p) => s + (p.deliveryFee || 0), 0),
        totalDeliveryCommission: list.reduce((s, p) => s + (p.deliveryCommission || 0), 0),
        totalMarkupRevenue: list.reduce((s, p) => s + (p.markupRevenue || 0), 0),
        totalGrandTotal: list.reduce((s, p) => s + (p.grandTotal || p.amount || 0), 0),
        pendingPayouts: list.filter(
          (p) => p.status === "completed" && p.payoutStatus !== "paid_out"
        ).length,
      });
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAsPaidOut = async (id: string) => {
    setMarkingId(id);
    try {
      await api.put(`/payment/payout/${id}`);
      toast.success("Store payout marked as paid");
      load();
    } catch {
      toast.error("Failed to update payout status.");
    } finally {
      setMarkingId(null);
    }
  };

  const filtered = payments.filter((p) => {
    if (filter === "pending_payout")
      return p.status === "completed" && p.payoutStatus !== "paid_out";
    if (filter === "paid_out") return p.payoutStatus === "paid_out";
    return true;
  });

  if (loading) return <p className="text-gray-500 p-4">Loading payments…</p>;

  return (
    <div className="font-inter">
      {/* Explains the Payments vs Payouts distinction directly in the UI */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
        <strong>Payments</strong> is a read-only ledger of money received from customers.
        To actually send a store their share, go to the <strong>Payouts</strong> tab.
      </div>
      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total Payments", value: stats.total.toString() },
          { label: "Gross Revenue (store prices)", value: formatNaira(stats.totalRevenue) },
          { label: "Store Payouts", value: formatNaira(stats.totalStorePayout) },
          { label: "Store Commission", value: formatNaira(stats.totalAdminFee) },
          { label: "Service Fee", value: formatNaira(stats.totalServiceFee) },
          { label: "Markup Revenue", value: formatNaira(stats.totalMarkupRevenue) },
          {
            label: "Pending Payouts",
            value: stats.pendingPayouts.toString(),
            color: stats.pendingPayouts > 0 ? "text-yellow-600" : "text-green-600",
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${(s as { color?: string }).color || ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Money flow breakdown — exactly where every naira goes, in plain terms */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-1">Where the money goes</h3>
        <p className="text-xs text-gray-400 mb-4">
          For every order: the customer pays the total below, split across the store and three
          separate platform revenue streams.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Total customer paid (grand total)</p>
              <p className="text-xs text-gray-400">Marked-up product total + delivery fee + service fee</p>
            </div>
            <p className="font-bold text-lg">{formatNaira(stats.totalGrandTotal)}</p>
          </div>

          <div className="pl-4 border-l-2 border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">→ Goes to stores</p>
                <p className="text-xs text-green-600">Store's own price minus their commission — never affected by markup</p>
              </div>
              <p className="font-bold text-green-700">{formatNaira(stats.totalStorePayout)}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">→ Goes to riders</p>
                <p className="text-xs text-blue-600">Distance-based delivery fee, minus Astercart's cut — the rider's actual take-home pay</p>
              </div>
              <p className="font-bold text-blue-700">{formatNaira(stats.totalDeliveryFee - stats.totalDeliveryCommission)}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div>
                <p className="font-medium text-teal-800">→ Platform keeps (Product Markup)</p>
                <p className="text-xs text-teal-600">Set individually per product — added on top of the store's own price</p>
              </div>
              <p className="font-bold text-teal-700">{formatNaira(stats.totalMarkupRevenue)}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">→ Platform keeps (Service Fee)</p>
                <p className="text-xs text-orange-600">% of the customer's order total (after markup), charged on top</p>
              </div>
              <p className="font-bold text-orange-700">{formatNaira(stats.totalServiceFee)}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-purple-800">→ Platform keeps (Store Commission)</p>
                <p className="text-xs text-purple-600">Taken out of the store's OWN price only — never from markup or delivery fee</p>
              </div>
              <p className="font-bold text-purple-700">{formatNaira(stats.totalAdminFee)}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
              <div>
                <p className="font-medium text-pink-800">→ Platform keeps (Delivery Commission)</p>
                <p className="text-xs text-pink-600">Astercart's cut of the delivery fee — the "Uber model" cut of the rider's fare</p>
              </div>
              <p className="font-bold text-pink-700">{formatNaira(stats.totalDeliveryCommission)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg mt-2">
            <p className="font-medium text-white">Total platform revenue (Markup + Service Fee + Commission + Delivery Commission)</p>
            <p className="font-bold text-lg text-white">{formatNaira(stats.totalMarkupRevenue + stats.totalServiceFee + stats.totalAdminFee + stats.totalDeliveryCommission)}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          ["all", "All payments"],
          ["pending_payout", "Pending payout"],
          ["paid_out", "Paid out"],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-xs px-4 py-1.5 rounded-full border font-medium ${
              filter === val ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Payment records</h2>
          <button
            onClick={() => exportToCSV(filtered)}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            📥 Export CSV
          </button>
        </div>
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">No payments found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-2">Order ID</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Subtotal (store price)</th>
                <th>Markup</th>
                <th>Delivery</th>
                <th>Delivery Commission</th>
                <th>Service Fee</th>
                <th>Customer Paid</th>
                <th>Store Gets</th>
                <th>Commission</th>
                <th>Astercart Revenue</th>
                <th>Status</th>
                <th>Payout</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                // Per-row total of every revenue stream Astercart actually
                // keeps from this specific order — previously this sum
                // only existed as a platform-wide total at the top of the
                // page, with no way to see it broken out per individual
                // order in the table itself.
                const astercartRevenue = (p.markupRevenue || 0) + (p.serviceFee || 0) + (p.adminFee || 0) + (p.deliveryCommission || 0);
                return (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">
                    {/* Consistent with admin/client elsewhere: last 8 chars
                        of the Mongo ID, so the same order shows the same
                        reference number everywhere across the platform. */}
                    {(p.orderId || p._id).slice(-8).toUpperCase()}
                  </td>
                  <td>{p.name || "—"}</td>
                  <td>{p.store?.name || "—"}</td>
                  <td className="font-medium">{formatNaira(p.amount)}</td>
                  <td className="text-teal-600">{formatNaira(p.markupRevenue || 0)}</td>
                  <td className="text-blue-500">{formatNaira(p.deliveryFee || 0)}</td>
                  <td className="text-pink-500">{formatNaira(p.deliveryCommission || 0)}</td>
                  <td className="text-orange-500">{formatNaira(p.serviceFee || 0)}</td>
                  <td className="font-bold">{formatNaira(p.grandTotal || p.amount)}</td>
                  <td className="text-green-600">{formatNaira(p.storePayout)}</td>
                  <td className="text-purple-600">{formatNaira(p.adminFee)}</td>
                  <td className="font-bold text-gray-900">{formatNaira(astercartRevenue)}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.payoutStatus === "paid_out"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.payoutStatus === "paid_out" ? "Paid out" : "Pending"}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("en-GB")}
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

export default PaymentAD;

// Financial reconciliation export
const exportToCSV = (payments: any[]) => {
  const headers = [
    "Date", "Order ID", "Customer", "Store",
    "Store Price Subtotal", "Markup Revenue", "Delivery Fee", "Delivery Commission", "Service Fee", "Customer Paid (Total)",
    "Store Payout", "Platform Commission",
    "Status", "Payout Status",
  ];
  const rows = payments.map(p => [
    new Date(p.createdAt).toLocaleDateString("en-GB"),
    (p.orderId || p._id).slice(-8).toUpperCase(),
    p.name || "",
    p.store?.name || "",
    p.amount || 0,
    p.markupRevenue || 0,
    p.deliveryFee || 0,
    p.deliveryCommission || 0,
    p.serviceFee || 0,
    p.grandTotal || p.amount || 0,
    p.storePayout || 0,
    p.adminFee || 0,
    p.status || "",
    p.payoutStatus || "pending",
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `astercart-payments-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
