import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useStoreAnalytics } from "../hooks/useStoreAnalytics";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const Analytics: React.FC = () => {
  const { analytics, loading } = useStoreAnalytics();

  if (loading) return <div className="p-8 text-gray-400">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-gray-400">No data yet. Analytics will appear once you have orders.</div>;

  return (
    <div className="font-inter space-y-6 pb-8">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Unique customers", value: analytics.totalCustomers },
          { label: "Avg order value", value: formatNaira(analytics.avgOrderValue) },
          { label: "Pending orders", value: analytics.pendingOrders, color: "text-yellow-600" },
          { label: "In preparation", value: analytics.processingOrders, color: "text-blue-600" },
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
