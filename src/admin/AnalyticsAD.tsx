import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend,
} from "recharts";
import api from "../utils/api";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

interface StoreRevenue {
  storeName: string;
  revenue: number;
  orders: number;
  platformFee: number;
}

interface DailyData {
  date: string;
  revenue: number;
  orders: number;
  newCustomers: number;
}

const AnalyticsAD: React.FC = () => {
  const [storeRevenue, setStoreRevenue] = useState<StoreRevenue[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPlatformFee, setTotalPlatformFee] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          api.get<any[]>("/adminOrder"),
          api.get<any[]>("/payment/all"),
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

        // Revenue by store
        const storeMap: Record<string, StoreRevenue> = {};
        orders.forEach((o: any) => {
          const name = o.storeName || "Unknown";
          if (!storeMap[name]) storeMap[name] = { storeName: name, revenue: 0, orders: 0, platformFee: 0 };
          storeMap[name].revenue += o.totalAmount || 0;
          storeMap[name].orders += 1;
          storeMap[name].platformFee += (o.totalAmount || 0) * 0.1;
        });
        const sortedStores = Object.values(storeMap).sort((a, b) => b.revenue - a.revenue);
        setStoreRevenue(sortedStores);

        // Totals
        const total = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
        const fee = payments.reduce((s: number, p: any) => s + (p.adminFee || 0), 0);
        setTotalRevenue(total);
        setTotalPlatformFee(fee);

        // Daily data - last 14 days
        const now = new Date();
        const daily: DailyData[] = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString("en-GB");
          const dayOrders = orders.filter((o: any) => {
            const od = new Date(o.createdAt);
            return od.toLocaleDateString("en-GB") === dateStr;
          });
          const dayRevenue = dayOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
          daily.push({ date: dateStr.slice(0, 5), revenue: dayRevenue, orders: dayOrders.length, newCustomers: 0 });
        }
        setDailyData(daily);
      } catch {
        setStoreRevenue([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-8 text-gray-400">Loading analytics...</p>;

  return (
    <div className="font-inter space-y-6">
      {/* Platform totals */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total marketplace revenue", value: formatNaira(totalRevenue) },
          { label: "Platform earnings (10%)", value: formatNaira(totalPlatformFee), color: "text-pry" },
          { label: "Store payouts (90%)", value: formatNaira(totalRevenue - totalPlatformFee), color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${(s as any).color || ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Platform revenue — last 14 days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatNaira(v)} />
            <Line type="monotone" dataKey="revenue" stroke="#FE5B18" strokeWidth={2} dot={false} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders per day */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Orders per day — last 14 days</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="orders" fill="#FE5B18" radius={[4, 4, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by store */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Revenue by store</h2>
        {storeRevenue.length === 0 ? (
          <p className="text-gray-400 text-sm">No revenue data yet.</p>
        ) : (
          <>
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={storeRevenue.slice(0, 10)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="storeName" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={(v: number) => formatNaira(v)} />
                  <Bar dataKey="revenue" fill="#FE5B18" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b text-xs">
                <tr>
                  <th className="py-2 text-left">Store</th>
                  <th className="text-right">Orders</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Platform fee</th>
                  <th className="text-right">Store payout</th>
                </tr>
              </thead>
              <tbody>
                {storeRevenue.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{s.storeName}</td>
                    <td className="text-right">{s.orders}</td>
                    <td className="text-right">{formatNaira(s.revenue)}</td>
                    <td className="text-right text-orange-500">{formatNaira(s.platformFee)}</td>
                    <td className="text-right text-green-600">{formatNaira(s.revenue - s.platformFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsAD;
