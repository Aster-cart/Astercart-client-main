import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface PayoutRow {
  _id: string;
  store?: { name?: string; address?: string };
  amount: number;
  storePayout: number;
  adminFee: number;
  status: string;
  payoutStatus?: string;
  createdAt: string;
  paidOutAt?: string;
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const PayoutsAD: React.FC = () => {
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PayoutRow[]>("/payment/all");
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id: string) => {
    setMarkingId(id);
    try {
      await api.put(`/payment/payout/${id}`);
      toast.success("Payout marked as paid");
      load();
    } catch { toast.error("Failed to mark payout."); }
    finally { setMarkingId(null); }
  };

  const exportCSV = () => {
    const headers = ["Date", "Store", "Email", "Order Amount", "Store Payout", "Platform Fee", "Status", "Payout Status"];
    const csvRows = filtered.map(r => [
      new Date(r.createdAt).toLocaleDateString("en-GB"),
      r.store?.name || "",
      r.storeEmail || "",
      r.amount || 0,
      r.storePayout || 0,
      r.adminFee || 0,
      r.status || "",
      r.payoutStatus || "pending",
    ]);
    const csv = [headers, ...csvRows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `payouts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filtered = rows.filter(r =>
    filter === "all" ? true :
    filter === "pending" ? r.payoutStatus !== "paid_out" :
    r.payoutStatus === "paid_out"
  );

  const totalDue = rows.filter(r => r.payoutStatus !== "paid_out").reduce((s, r) => s + (r.storePayout || 0), 0);
  const totalPaid = rows.filter(r => r.payoutStatus === "paid_out").reduce((s, r) => s + (r.storePayout || 0), 0);
  const totalPlatformEarned = rows.reduce((s, r) => s + (r.adminFee || 0), 0);

  return (
    <div className="font-inter">
      {/* Explains the Payments vs Payouts distinction directly in the UI */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
        <strong>Payouts</strong> is where you send each store their share of what
        customers paid. Mark an entry as paid once the bank transfer has actually
        been sent — this updates the store's earnings page too.
      </div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Pending payouts</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{formatNaira(totalDue)}</p>
          <p className="text-xs text-gray-400 mt-1">Owed to stores</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total paid out</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatNaira(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Platform earnings</p>
          <p className="text-2xl font-bold text-pry mt-1">{formatNaira(totalPlatformEarned)}</p>
          <p className="text-xs text-gray-400 mt-1">Commission only — excludes delivery and service fee</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4 items-center">
        <div className="flex gap-2">
          {(["all", "pending", "paid"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-medium border ${filter === f ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="ml-auto text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
          📥 Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? <p className="p-8 text-center text-gray-400">Loading…</p> : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs bg-gray-50">
              <tr>
                <th className="py-3 px-4">Store</th>
                <th className="px-4">Order amount</th>
                <th className="px-4">Store payout</th>
                <th className="px-4">Platform fee (10%)</th>
                <th className="px-4">Date</th>
                <th className="px-4">Payout status</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No payouts found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium">{r.store?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{r.storeEmail || ""}</p>
                  </td>
                  <td className="px-4">{formatNaira(r.amount)}</td>
                  <td className="px-4 text-green-600 font-medium">{formatNaira(r.storePayout)}</td>
                  <td className="px-4 text-orange-500">{formatNaira(r.adminFee)}</td>
                  <td className="px-4 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.payoutStatus === "paid_out" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.payoutStatus === "paid_out" ? "Paid out" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4">
                    {r.payoutStatus !== "paid_out" && (
                      <button
                        onClick={() => markPaid(r._id)}
                        disabled={markingId === r._id}
                        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-medium disabled:opacity-60"
                      >
                        {markingId === r._id ? "…" : "Mark paid"}
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

export default PayoutsAD;
