import React from "react";
import { search } from "../assets/res";
import { useDashboard } from "../hooks/useDashboard";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-600",
};

const Dashboard: React.FC = () => {
  const {
    mockDashboardData,
    mockAllTransactionData,
    selectedFilter,
    setSelectedFilter,
    isOpen,
    setIsOpen,
    searchQuery,
    handleSearchChange,
    filteredTransactions,
  } = useDashboard();

  const rows = filteredTransactions as any[];

  return (
    <div>
      {/* Stats tiles */}
      <div className="flex w-full font-inter justify-between py-2 flex-wrap gap-2">
        {[
          { label: "All Transactions", value: mockDashboardData.transactions },
          { label: "Gross Revenue", value: mockDashboardData.amountMade },
          { label: "Your Store Payout (90%)", value: mockDashboardData.totalFeesCharged },
          { label: "Platform Fee (10%)", value: (mockDashboardData as any).platformFee || "₦0", orange: true },
        ].map((s, i) => (
          <div key={i} className="flex flex-col justify-between p-3 border bg-white border-fade rounded-lg h-[70px] flex-1 min-w-[160px] mx-1">
            <span className="text-sm leading-4 text-gray-600">{s.label}</span>
            <span className={`font-medium text-xl leading-7 ${s.orange ? "text-orange-600" : ""}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Transaction table */}
      <div className="mt-1 mx-2 p-3 font-inter bg-white rounded-2xl">
        <div className="flex justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">All Transactions</h2>
            <span className="bg-pry rounded text-white px-2 text-xs">
              {mockAllTransactionData.allTransactions}
            </span>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <img src={search} alt="" className="w-4 h-4" />
              </div>
              <input
                type="search"
                placeholder="Search customer or order no..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border rounded-lg text-xs border-gray-200 focus:outline-none focus:border-pry w-64"
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span>{selectedFilter}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="absolute right-0 bg-white border border-gray-200 rounded-lg mt-1 w-48 shadow-lg z-10">
                  {["All Transactions", "Recent Transaction"].map((opt) => (
                    <button
                      key={opt}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => { setSelectedFilter(opt); setIsOpen(false); }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table — one row per ORDER */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-gray-400 border-b">
              <tr>
                <th className="px-2 py-3">S/N</th>
                <th className="px-2 py-3">Customer</th>
                <th className="px-2 py-3">Order No</th>
                <th className="px-2 py-3">Amount</th>
                <th className="px-2 py-3">Items</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Payment</th>
                <th className="px-2 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-2 py-3">{row.user}</td>
                    <td className="px-2 py-3 font-mono">{row.orderNo || row.transactionId}</td>
                    <td className="px-2 py-3 font-medium">{row.amount}</td>
                    <td className="px-2 py-3">{row.itemCount} item{row.itemCount !== 1 ? "s" : ""}</td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-1 rounded-full font-medium ${STATUS_COLOR[row.status] || "bg-gray-100 text-gray-500"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-1 rounded-full font-medium ${row.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-gray-400">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB") : "—"}
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

export default Dashboard;
