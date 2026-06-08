import React, { useEffect, useState } from "react";
import api from "../utils/api";

interface PaymentRow {
  _id: string;
  orderId: string;
  name: string;
  amount: number;
  storePayout: number;
  adminFee: number;
  status: string;
  createdAt: string;
  store?: { name?: string };
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

const PaymentAD: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0, totalStorePayout: 0, totalAdminFee: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ payments?: PaymentRow[] } | PaymentRow[]>("/payment/all");
        const list: PaymentRow[] = Array.isArray(data) ? data : (data as { payments?: PaymentRow[] }).payments || [];
        setPayments(list);
        setStats({
          total: list.length,
          totalRevenue: list.reduce((s, p) => s + (p.amount || 0), 0),
          totalStorePayout: list.reduce((s, p) => s + (p.storePayout || 0), 0),
          totalAdminFee: list.reduce((s, p) => s + (p.adminFee || 0), 0),
        });
      } catch { setPayments([]); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <p className="text-gray-500 p-4">Loading payments…</p>;

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Payments", value: stats.total.toString() },
          { label: "Total Revenue", value: formatNaira(stats.totalRevenue) },
          { label: "Store Payouts", value: formatNaira(stats.totalStorePayout) },
          { label: "Platform Fees", value: formatNaira(stats.totalAdminFee) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Payment records</h2>
        {payments.length === 0 ? (
          <p className="text-gray-400 text-sm">No payments recorded yet.</p>
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">{(p.orderId || p._id).slice(0, 10).toUpperCase()}</td>
                  <td>{p.name || "—"}</td>
                  <td>{p.store?.name || "—"}</td>
                  <td className="font-medium">{formatNaira(p.amount)}</td>
                  <td className="text-green-600">{formatNaira(p.storePayout)}</td>
                  <td className="text-blue-600">{formatNaira(p.adminFee)}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString("en-GB")}</td>
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
