import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useStoreAnalytics } from "../hooks/useStoreAnalytics";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", processing: "Preparing", out_for_delivery: "Out for delivery",
  delivered: "Delivered", completed: "Completed", canceled: "Cancelled", unknown: "Unknown",
};

const PIE_COLORS = ["#FE5B18", "#3B82F6", "#22C55E", "#A855F7", "#F59E0B", "#EF4444", "#6B7280"];

// A trend indicator showing % change vs the prior period — this is the
// genuinely useful context that was missing before: a bare number like
// "₦45,000 this week" tells a store nothing about whether that's good or
// bad without something to compare it against.
const TrendBadge: React.FC<{ percent: number | null }> = ({ percent }) => {
  if (percent === null) return <span className="text-xs text-gray-400">No prior data to compare</span>;
  const isUp = percent >= 0;
  return (
    <span className={`text-xs font-medium ${isUp ? "text-green-600" : "text-red-500"}`}>
      {isUp ? "▲" : "▼"} {Math.abs(percent)}% vs last week
    </span>
  );
};

const Analytics: React.FC = () => {
  const { analytics, loading } = useStoreAnalytics();

  if (loading) return <div className="p-8 text-gray-400">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-gray-400">No data yet. Analytics will appear once you have orders.</div>;

  return (
    <div className="font-inter space-y-6 pb-8">
      {/* Week-over-week comparison — the headline numbers a store actually
          wants to know at a glance: "am I doing better or worse than last
          week?" */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border">
          <p className="text-sm text-gray-500 mb-1">Revenue this week</p>
          <p className="text-2xl font-bold">{formatNaira(analytics.thisWeekRevenue)}</p>
          <div className="mt-1"><TrendBadge percent={analytics.revenueChangePercent} /></div>
        </div>
        <div className="bg-white rounded-xl p-5 border">
          <p className="text-sm text-gray-500 mb-1">Orders this week</p>
          <p className="text-2xl font-bold">{analytics.thisWeekOrders}</p>
          <div className="mt-1"><TrendBadge percent={analytics.ordersChangePercent} /></div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total customers", value: analytics.totalCustomers },
          { label: "Returning customers", value: analytics.returningCustomers, color: "text-green-600" },
          { label: "New customers", value: analytics.newCustomers, color: "text-blue-600" },
          { label: "Avg order value", value: formatNaira(analytics.avgOrderValue) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${(s as any).color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart - last 7 days */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Revenue — last 7 days</h2>
        {analytics.dailyRevenue.every(d => d.revenue === 0) ? (
          <p className="text-gray-400 text-sm py-8 text-center">No revenue data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.dailyRevenue}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatNaira(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#FE5B18" strokeWidth={2} dot={{ fill: "#FE5B18", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Orders per day chart */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Orders per day — last 7 days</h2>
          {analytics.dailyRevenue.every(d => d.orders === 0) ? (
            <p className="text-gray-400 text-sm py-8 text-center">No order data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.dailyRevenue}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#FE5B18" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status breakdown — genuinely new: previously only
            pending/processing were tracked in isolation, with no
            visibility into the full order pipeline at a glance. */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Orders by status</h2>
          {analytics.statusBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={analytics.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%" cy="50%"
                  outerRadius={65}
                  label={({ status, count }) => `${STATUS_LABELS[status] || status}: ${count}`}
                  labelLine={false}
                  style={{ fontSize: 11 }}
                >
                  {analytics.statusBreakdown.map((entry, i) => (
                    <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, STATUS_LABELS[name] || name]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sales by category — genuinely new: a store selling across
          multiple categories previously had no way to see which category
          actually drives their revenue. */}
      {analytics.categorySales.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Revenue by category</h2>
          <ResponsiveContainer width="100%" height={Math.max(160, analytics.categorySales.length * 36)}>
            <BarChart data={analytics.categorySales} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v: number) => formatNaira(v)} />
              <Bar dataKey="revenue" fill="#FE5B18" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Best selling products */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Best selling products</h2>
        {analytics.bestSellers.length === 0 ? (
          <p className="text-gray-400 text-sm">No sales data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-2 text-left">Product</th>
                <th className="text-right">Units sold</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.bestSellers.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pry text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {p.name}
                    </div>
                  </td>
                  <td className="text-right font-medium">{p.totalSold}</td>
                  <td className="text-right font-medium text-green-600">{formatNaira(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Analytics;
