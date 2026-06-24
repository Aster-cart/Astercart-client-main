import React from "react";
import { useDashboard } from "../hooks/useDashboard";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const Earnings: React.FC = () => {
  const { mockDashboardData, filteredTransactions } = useDashboard();

  const rows = filteredTransactions as any[];
  const pendingPayout = rows.filter(r => r.payoutStatus !== "paid_out" && r.status !== "canceled" && r.status !== "failed");

  return (
    <div className="font-inter pb-8">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total earned (gross — your product sales)", value: mockDashboardData.amountMade, color: "" },
          { label: "Your payout", value: mockDashboardData.totalFeesCharged, color: "text-green-600" },
          { label: "Platform commission", value: (mockDashboardData as any).platformFee || "₦0", color: "text-orange-500" },
          { label: "Pending payout", value: `${pendingPayout.length} orders`, color: "text-yellow-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* How payouts work */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">How payouts work</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You are paid based on your product subtotal — never the delivery fee or service fee</li>
          <li>• Astercart retains a commission percentage from your product subtotal (default 10%, may vary per agreement)</li>
          <li>• The customer separately pays a delivery fee and a service fee — neither of these come out of your payout</li>
          <li>• Payouts are processed by the admin team and marked as paid once transferred</li>
          <li>• Contact support if you have a payment dispute</li>
        </ul>
      </div>

      {/* Earnings table */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-4">Earnings history</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-2">Order</th>
                <th className="px-2">Customer</th>
                <th className="px-2">Product subtotal</th>
                <th className="px-2">Your payout</th>
                <th className="px-2">Platform commission</th>
                <th className="px-2">Status</th>
                <th className="px-2">Payout status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-mono text-xs">{row.orderNo}</td>
                    <td className="px-2">{row.user}</td>
                    {/* Every figure below is read directly from what the
                        server actually calculated and saved — never
                        recomputed here as a flat percentage. This is what
                        guarantees this table always agrees with the admin
                        dashboard for the exact same order. */}
                    <td className="px-2 font-medium">{formatNaira(row.amount ? Number(String(row.amount).replace(/[^0-9.]/g, "")) : 0)}</td>
                    <td className="px-2 text-green-600 font-medium">{formatNaira(row.storePayout)}</td>
                    <td className="px-2 text-orange-500">{formatNaira(row.platformCommission)}</td>
                    <td className="px-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.payoutStatus === "paid_out"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {row.payoutStatus === "paid_out" ? "Paid out" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
