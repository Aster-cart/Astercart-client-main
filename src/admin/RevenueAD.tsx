import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import api from "../utils/api";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const PIE_COLORS = ["#FE5B18", "#10B981", "#6366F1", "#F59E0B", "#EC4899", "#06B6D4", "#8B5CF6", "#84CC16"];

interface Summary {
  grossRevenue: number;
  netRevenue: number;
  platformRevenue: number;
  storePayouts: number;
  riderPayouts: number;
  gatewayFees: number;
  totalRefunds: number;
  withdrawalsPaid: number;
  pendingWithdrawals: number;
}

interface ChartPoint {
  period: string;
  totalAstercartRevenue?: number;
  netPlatformProfit?: number;
  totalRefunds?: number;
  transactionCount?: number;
}

interface StoreRow {
  storeName: string;
  transactionCount: number;
  totalRevenue: number;
  netProfit: number;
}

interface CategoryRow {
  category: string;
  totalRevenue: number;
  orderCount: number;
  itemCount: number;
}

interface GatewayRow {
  gateway: string;
  totalRevenue: number;
  orderCount: number;
}

interface CustomerRow {
  customerName: string;
  customerEmail: string;
  totalSpend: number;
  orderCount: number;
}

const RevenueAD: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [topStores, setTopStores] = useState<StoreRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [gateways, setGateways] = useState<GatewayRow[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerRow[]>([]);

  const params = { from, to };

  const load = async () => {
    setLoading(true);
    try {
      const [summaryRes, chartRes, storesRes, catRes, gwRes, custRes] = await Promise.all([
        api.get("/admin/revenue/summary", { params }),
        api.get("/admin/revenue/chart", { params: { ...params, period } }),
        api.get("/admin/revenue/top-stores", { params }),
        api.get("/admin/revenue/by-category", { params }),
        api.get("/admin/revenue/by-gateway", { params }),
        api.get("/admin/revenue/top-customers", { params }),
      ]);
      setSummary(summaryRes.data.cards || null);
      setChart(Array.isArray(chartRes.data.data) ? chartRes.data.data : []);
      setTopStores(Array.isArray(storesRes.data.stores) ? storesRes.data.stores : []);
      setCategories(Array.isArray(catRes.data.categories) ? catRes.data.categories : []);
      setGateways(Array.isArray(gwRes.data.gateways) ? gwRes.data.gateways : []);
      setTopCustomers(Array.isArray(custRes.data.customers) ? custRes.data.customers : []);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportCSV = async () => {
    const url = `/admin/revenue/export?from=${from}&to=${to}`;
    const res = await api.get(url, { responseType: "blob" });
    const blob = new Blob([res.data as BlobPart], { type: "text/csv" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `astercart-revenue-${from}-to-${to}.csv`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  if (loading) return <p className="text-muted p-4">Loading revenue data…</p>;

  const cards = [
    { label: "Gross customer payments", value: summary?.grossRevenue ?? 0, color: "" },
    { label: "Net platform profit", value: summary?.netRevenue ?? 0, color: "text-green-600" },
    { label: "Astercart revenue", value: summary?.platformRevenue ?? 0, color: "text-pry" },
    { label: "Store payouts", value: summary?.storePayouts ?? 0, color: "" },
    { label: "Rider payouts", value: summary?.riderPayouts ?? 0, color: "" },
    { label: "Gateway fees", value: summary?.gatewayFees ?? 0, color: "" },
    { label: "Total refunds", value: summary?.totalRefunds ?? 0, color: "text-red-600" },
    { label: "Withdrawals paid", value: summary?.withdrawalsPaid ?? 0, color: "" },
    { label: "Pending withdrawals", value: summary?.pendingWithdrawals ?? 0, color: "text-yellow-600" },
  ];

  return (
    <div className="font-inter space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-muted mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <button onClick={load} className="px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium">Apply</button>
        <button onClick={exportCSV} className="px-4 py-2 bg-gray-100 text-body rounded-lg text-sm font-medium">📥 Export CSV</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-muted mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color || ""}`}>{formatNaira(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-1">Revenue trend</h2>
        <p className="text-xs text-muted mb-4">Astercart revenue and net profit per {period.slice(0, -2)}.</p>
        {chart.length === 0 ? (
          <p className="text-muted text-sm">No data for this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatNaira(v)} />
              <Line type="monotone" dataKey="totalAstercartRevenue" stroke="#FE5B18" strokeWidth={2} dot={false} name="Astercart revenue" />
              <Line type="monotone" dataKey="netPlatformProfit" stroke="#10B981" strokeWidth={2} dot={false} name="Net profit" />
              <Line type="monotone" dataKey="totalRefunds" stroke="#EF4444" strokeWidth={1.5} dot={false} name="Refunds" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top stores */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Top stores</h2>
          {topStores.length === 0 ? (
            <p className="text-muted text-sm">No data.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted border-b text-xs">
                <tr>
                  <th className="py-2 text-left">Store</th>
                  <th className="text-right">Orders</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Net profit</th>
                </tr>
              </thead>
              <tbody>
                {topStores.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-off-white">
                    <td className="py-2.5 font-medium">{s.storeName}</td>
                    <td className="text-right">{s.transactionCount}</td>
                    <td className="text-right">{formatNaira(s.totalRevenue)}</td>
                    <td className="text-right text-green-600">{formatNaira(s.netProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* By gateway */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Revenue by gateway</h2>
          {gateways.length === 0 ? (
            <p className="text-muted text-sm">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={gateways} dataKey="totalRevenue" nameKey="gateway" innerRadius={40} outerRadius={70} label>
                  {gateways.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatNaira(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <table className="w-full text-sm mt-2">
            <thead className="text-muted border-b text-xs">
              <tr>
                <th className="py-2 text-left">Gateway</th>
                <th className="text-right">Orders</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {gateways.map((g, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 capitalize">{g.gateway}</td>
                  <td className="text-right">{g.orderCount}</td>
                  <td className="text-right">{formatNaira(g.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By category */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-1">Revenue by category</h2>
        <p className="text-xs text-muted mb-3">Product category totals, derived from order line items.</p>
        {categories.length === 0 ? (
          <p className="text-muted text-sm">No data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatNaira(v)} />
              <Bar dataKey="totalRevenue" fill="#FE5B18" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top customers */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-3">Top customers</h2>
        {topCustomers.length === 0 ? (
          <p className="text-muted text-sm">No data.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-muted border-b text-xs">
              <tr>
                <th className="py-2 text-left">Customer</th>
                <th className="text-left">Email</th>
                <th className="text-right">Orders</th>
                <th className="text-right">Total spend</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={i} className="border-b hover:bg-off-white">
                  <td className="py-2.5 font-medium">{c.customerName}</td>
                  <td className="text-muted text-xs">{c.customerEmail || "—"}</td>
                  <td className="text-right">{c.orderCount}</td>
                  <td className="text-right">{formatNaira(c.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RevenueAD;
