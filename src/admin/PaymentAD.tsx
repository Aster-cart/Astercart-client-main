import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface PaymentRow {
  _id: string;
  orderId: string;
  name: string;
  amount: number;
  storePayout: number;
  adminFee: number;
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
    total: 0, totalRevenue: 0, totalStorePayout: 0, totalAdminFee: 0, pendingPayouts: 0,
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
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Payments", value: stats.total.toString() },
          { label: "Gross Revenue", value: formatNaira(stats.totalRevenue) },
          { label: "Store Payouts", value: formatNaira(stats.totalStorePayout) },
          { label: "Platform Fees", value: formatNaira(stats.totalAdminFee) },
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
                <th>Amount</th>
                <th>Store Payout</th>
                <th>Platform Fee</th>
                <th>Status</th>
                <th>Payout</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">
                    {(p.orderId || p._id).slice(0, 8).toUpperCase()}
                  </td>
                  <td>{p.name || "—"}</td>
                  <td>{p.store?.name || "—"}</td>
                  <td className="font-medium">{formatNaira(p.amount)}</td>
                  <td className="text-green-600">{formatNaira(p.storePayout)}</td>
                  <td className="text-blue-600">{formatNaira(p.adminFee)}</td>
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
                  <td>
                    {p.status === "completed" && p.payoutStatus !== "paid_out" && (
                      <button
                        onClick={() => markAsPaidOut(p._id)}
                        disabled={markingId === p._id}
                        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-medium"
                      >
                        {markingId === p._id ? "..." : "Mark paid out"}
                      </button>
                    )}
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

export default PaymentAD;

// Financial reconciliation export
const exportToCSV = (payments: any[]) => {
  const headers = ["Date", "Order ID", "Customer", "Store", "Amount", "Store Payout", "Platform Fee", "Status", "Payout Status"];
  const rows = payments.map(p => [
    new Date(p.createdAt).toLocaleDateString("en-GB"),
    (p.orderId || p._id).slice(0, 10).toUpperCase(),
    p.name || "",
    p.store?.name || "",
    p.amount || 0,
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
