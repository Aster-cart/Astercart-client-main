import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import api from "../utils/api";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

interface StoreRevenue {
  storeName: string;
  revenue: number;
  orders: number;
  platformFee: number;
  markupRevenue: number;
  storePayout: number;
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
  const [totalStorePayout, setTotalStorePayout] = useState(0);
  const [totalDeliveryFee, setTotalDeliveryFee] = useState(0);
  const [totalDeliveryCommission, setTotalDeliveryCommission] = useState(0);
  const [totalRiderPayout, setTotalRiderPayout] = useState(0);
  const [totalServiceFee, setTotalServiceFee] = useState(0);
  const [totalMarkupRevenue, setTotalMarkupRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          api.get<any[]>("/adminOrder"),
          api.get<any[]>("/payment/all"),
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

        // Revenue by store — every figure read directly from the order's
        // own real fields, never recomputed as a flat percentage. This was
        // previously hardcoding platformFee at totalAmount * 0.1 regardless
        // of any per-store commission override, which silently disagreed
        // with the real number shown on the Payments page for the same
        // orders.
        const storeMap: Record<string, StoreRevenue> = {};
        orders.forEach((o: any) => {
          const name = o.storeName || "Unknown";
          if (!storeMap[name]) storeMap[name] = { storeName: name, revenue: 0, orders: 0, platformFee: 0, markupRevenue: 0, storePayout: 0 };
          storeMap[name].revenue += o.totalAmount || 0;
          storeMap[name].orders += 1;
          storeMap[name].platformFee += o.platformCommission || 0;
          storeMap[name].markupRevenue += o.markupRevenue || 0;
          storeMap[name].storePayout += o.storePayout != null ? o.storePayout : (o.totalAmount || 0);
        });
        const sortedStores = Object.values(storeMap).sort((a, b) => b.revenue - a.revenue);
        setStoreRevenue(sortedStores);

        // Totals — read directly from the Payment ledger, which already
        // carries the real, authoritative figures for every paid order.
        const total = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
        const fee = payments.reduce((s: number, p: any) => s + (p.adminFee || 0), 0);
        const payout = payments.reduce((s: number, p: any) => s + (p.storePayout || 0), 0);
        const deliveryTotal = payments.reduce((s: number, p: any) => s + (p.deliveryFee || 0), 0);
        const deliveryCommissionTotal = payments.reduce((s: number, p: any) => s + (p.deliveryCommission || 0), 0);
        const riderPayoutTotal = payments.reduce((s: number, p: any) => s + (p.riderPayout || 0), 0);
        const serviceTotal = payments.reduce((s: number, p: any) => s + (p.serviceFee || 0), 0);
        const markupTotal = payments.reduce((s: number, p: any) => s + (p.markupRevenue || 0), 0);
        setTotalRevenue(total);
        setTotalPlatformFee(fee);
        setTotalStorePayout(payout);
        setTotalDeliveryFee(deliveryTotal);
        setTotalDeliveryCommission(deliveryCommissionTotal);
        setTotalRiderPayout(riderPayoutTotal);
        setTotalServiceFee(serviceTotal);
        setTotalMarkupRevenue(markupTotal);

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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Store sale value (not Astercart revenue)</p>
          <p className="text-xl font-bold mt-1">{formatNaira(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Store payouts</p>
          <p className="text-xl font-bold mt-1 text-green-600">{formatNaira(totalStorePayout)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Markup revenue</p>
          <p className="text-xl font-bold mt-1 text-teal-600">{formatNaira(totalMarkupRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Service fees collected</p>
          <p className="text-xl font-bold mt-1 text-orange-600">{formatNaira(totalServiceFee)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Platform commission</p>
          <p className="text-xl font-bold mt-1 text-purple-600">{formatNaira(totalPlatformFee)}</p>
        </div>
        {/* Delivery fee is now split — riders earn the majority, Astercart
            takes a cut (the Uber/Bolt model), so this needed two separate
            tiles instead of one combined "delivery fees collected" figure
            that didn't distinguish who actually keeps the money. */}
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total delivery fees (riders + Astercart)</p>
          <p className="text-xl font-bold mt-1 text-blue-600">{formatNaira(totalDeliveryFee)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Rider payouts</p>
          <p className="text-xl font-bold mt-1 text-blue-500">{formatNaira(totalRiderPayout)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Delivery commission (Astercart's cut)</p>
          <p className="text-xl font-bold mt-1 text-pink-600">{formatNaira(totalDeliveryCommission)}</p>
        </div>
      </div>

      {/* This is the one true platform-earnings figure — every other tile
          above is a single revenue stream shown in isolation, but none of
          them, on their own, represent what Astercart actually earns
          across the platform. Now correctly includes delivery commission
          as the fourth revenue stream — previously this total only summed
          three of the four, silently undercounting real platform revenue
          the moment distance-based delivery pricing was introduced. */}
      <div className="bg-gray-900 rounded-xl p-5">
        <p className="text-sm text-gray-300">Total Astercart Revenue (Markup + Service Fee + Commission + Delivery Commission)</p>
        <p className="text-3xl font-bold text-white mt-1">
          {formatNaira(totalMarkupRevenue + totalServiceFee + totalPlatformFee + totalDeliveryCommission)}
        </p>
      </div>

      {/* Revenue trend chart */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Platform sales volume — last 14 days</h2>
        <p className="text-xs text-gray-400 mb-2">Total store sale value moving through the platform, not Astercart's own revenue.</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatNaira(v)} />
            <Line type="monotone" dataKey="revenue" stroke="#FE5B18" strokeWidth={2} dot={false} name="Sales volume" />
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
        <p className="text-xs text-gray-400 mb-3">
          "Astercart revenue" here excludes service fee and delivery commission, since both are
          calculated per customer order/delivery, not attributable to a single store when a cart
          spans multiple stores. See the total platform revenue card above for the full figure.
        </p>
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
                  <th className="text-right">Store sale value</th>
                  <th className="text-right">Markup</th>
                  <th className="text-right">Commission</th>
                  <th className="text-right">Astercart revenue (markup + commission)</th>
                  <th className="text-right">Store payout</th>
                </tr>
              </thead>
              <tbody>
                {storeRevenue.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{s.storeName}</td>
                    <td className="text-right">{s.orders}</td>
                    <td className="text-right">{formatNaira(s.revenue)}</td>
                    <td className="text-right text-teal-600">{formatNaira(s.markupRevenue)}</td>
                    <td className="text-right text-purple-500">{formatNaira(s.platformFee)}</td>
                    <td className="text-right font-bold text-gray-900">{formatNaira(s.markupRevenue + s.platformFee)}</td>
                    <td className="text-right text-green-600">{formatNaira(s.storePayout)}</td>
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
