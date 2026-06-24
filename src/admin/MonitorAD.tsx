import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";

interface Alert {
  id: string;
  type: "new_store" | "new_order" | "payment_failed" | "dispute" | "low_stock" | "store_pending";
  title: string;
  detail: string;
  time: string;
  severity: "high" | "medium" | "low";
  link?: string;
}

interface SystemStats {
  totalStores: number;
  pendingStores: number;
  totalOrders: number;
  unpaidOrders: number;
  openDisputes: number;
  totalProducts: number;
  outOfStockProducts: number;
  totalCustomers: number;
  todayOrders: number;
  todayRevenue: number;
}

const SEV_COLOR = {
  high: "bg-red-100 border-red-300 text-red-700",
  medium: "bg-yellow-100 border-yellow-300 text-yellow-700",
  low: "bg-blue-100 border-blue-300 text-blue-700",
};

const SEV_DOT = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-400",
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const MonitorAD: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback(async () => {
    try {
      // Fetch each independently so one failure doesn't kill everything.
      // Note: getProductStats uses MongoDB's countDocuments for the
      // headline numbers — accurate regardless of how many products exist.
      // The capped get-all-products-admin fetch below is kept ONLY to
      // build the low-stock alert detail text (which needs a sample of
      // actual product names) — previously its capped length was also
      // being used as if it were the platform's TRUE total product count,
      // which silently undercounted anything beyond the cap.
      const results = await Promise.allSettled([
        api.get("/store/adminstore"),
        api.get("/adminOrder"),
        api.get("/admin/disputes"),
        api.get("/store/get-all-products-admin?limit=500"),
        api.get("/adminCustomer/customers"),
        api.get("/store/admin/products/stats"),
      ]);

      const storesData = results[0].status === "fulfilled" ? results[0].value.data : {};
      const ordersData = results[1].status === "fulfilled" ? results[1].value.data : [];
      const disputesData = results[2].status === "fulfilled" ? results[2].value.data : [];
      const productsData = results[3].status === "fulfilled" ? results[3].value.data : [];
      const customersData = results[4].status === "fulfilled" ? results[4].value.data : [];
      const productStatsData = results[5].status === "fulfilled" ? results[5].value.data : null;

      const stores = (storesData as any)?.stores || (Array.isArray(storesData) ? storesData : []);
      const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.orders || [];
      const disputes = Array.isArray(disputesData) ? disputesData : [];
      const products = Array.isArray(productsData) ? productsData : (productsData as any)?.products || [];
      const customers = Array.isArray(customersData) ? customersData : (customersData as any)?.customers || [];

      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
      const todayRevenue = todayOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);

      const newStats: SystemStats = {
        totalStores: stores.length,
        pendingStores: stores.filter((s: any) => s.status === "pending").length,
        totalOrders: orders.length,
        unpaidOrders: orders.filter((o: any) => o.paymentStatus !== "paid").length,
        openDisputes: disputes.filter((d: any) => d.status === "open").length,
        // Use the accurate countDocuments-based stats when available,
        // falling back to the capped sample's length only if that request
        // genuinely failed.
        totalProducts: productStatsData?.totalProducts ?? products.length,
        outOfStockProducts: productStatsData?.outOfStock ?? products.filter((p: any) => Number(p.quantity ?? 0) === 0).length,
        totalCustomers: customers.length,
        todayOrders: todayOrders.length,
        todayRevenue,
      };
      setStats(newStats);

      // Build alerts from live data
      const newAlerts: Alert[] = [];

      // Pending stores waiting approval
      stores.filter((s: any) => s.status === "pending").forEach((s: any) => {
        newAlerts.push({
          id: `store_${s.storeId}`,
          type: "store_pending",
          title: "Store awaiting approval",
          detail: `${s.name} signed up and is waiting for your approval to go live.`,
          time: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-GB") : "Recently",
          severity: "high",
        });
      });

      // Open disputes
      disputes.filter((d: any) => d.status === "open").forEach((d: any) => {
        newAlerts.push({
          id: `dispute_${d._id}`,
          type: "dispute",
          title: `Open complaint — ${d.issueType}`,
          detail: `${d.customerName} complained about ${d.storeName || "a store"}: "${d.description?.slice(0, 80)}..."`,
          time: new Date(d.createdAt).toLocaleDateString("en-GB"),
          severity: "high",
        });
      });

      // Unpaid orders older than 1 hour
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const stuckOrders = orders.filter((o: any) =>
        o.paymentStatus !== "paid" &&
        o.status !== "canceled" &&
        new Date(o.createdAt).getTime() < oneHourAgo
      );
      if (stuckOrders.length > 0) {
        newAlerts.push({
          id: "stuck_orders",
          type: "payment_failed",
          title: `${stuckOrders.length} unpaid order${stuckOrders.length > 1 ? "s" : ""} (>1 hour old)`,
          detail: "These orders were placed but payment was not confirmed. May need manual review or recovery.",
          time: "Now",
          severity: "medium",
        });
      }

      // Out of stock products
      const outOfStock = products.filter((p: any) => Number(p.quantity ?? 0) === 0);
      if (outOfStock.length > 0) {
        newAlerts.push({
          id: "out_of_stock",
          type: "low_stock",
          title: `${outOfStock.length} products out of stock`,
          detail: `Stores: ${[...new Set(outOfStock.map((p: any) => p.storeName || p.storeId?.name))].slice(0, 3).join(", ")}`,
          time: "Now",
          severity: "low",
        });
      }

      // Today's activity
      if (todayOrders.length > 0) {
        newAlerts.push({
          id: "today_orders",
          type: "new_order",
          title: `${todayOrders.length} orders today`,
          detail: `Total revenue today: ${formatNaira(todayRevenue)}`,
          time: "Today",
          severity: "low",
        });
      }

      // Sort: high severity first
      newAlerts.sort((a, b) =>
        ({ high: 0, medium: 1, low: 2 }[a.severity]) - ({ high: 0, medium: 1, low: 2 }[b.severity])
      );

      setAlerts(newAlerts);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Monitor load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(load, 60000); // refresh every 60 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, load]);

  return (
    <div className="font-inter">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">System Monitor</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Last updated: {lastUpdated.toLocaleTimeString("en-GB")}
            {autoRefresh && " · Auto-refreshing every 60s"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`text-sm px-4 py-2 rounded-lg font-medium ${autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {autoRefresh ? "⏸ Pause" : "▶ Auto-refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading system data...</p>
      ) : (
        <>
          {/* Live stats grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total stores", value: stats?.totalStores, sub: `${stats?.pendingStores} pending approval`, subColor: stats?.pendingStores ? "text-yellow-600" : "text-gray-400" },
              { label: "Total orders", value: stats?.totalOrders, sub: `${stats?.todayOrders} today`, subColor: "text-green-600" },
              { label: "Today's revenue", value: formatNaira(stats?.todayRevenue || 0), sub: `${stats?.unpaidOrders} unpaid orders`, subColor: stats?.unpaidOrders ? "text-red-500" : "text-gray-400" },
              { label: "Open disputes", value: stats?.openDisputes, sub: "Needs attention", subColor: stats?.openDisputes ? "text-red-500" : "text-gray-400" },
              { label: "Total products", value: stats?.totalProducts, sub: `${stats?.outOfStockProducts} out of stock`, subColor: stats?.outOfStockProducts ? "text-yellow-600" : "text-gray-400" },
              { label: "Total customers", value: stats?.totalCustomers, sub: "Registered accounts", subColor: "text-gray-400" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold">{s.value ?? "—"}</p>
                <p className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">
                Live alerts
                {alerts.filter(a => a.severity === "high").length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {alerts.filter(a => a.severity === "high").length} critical
                  </span>
                )}
              </h2>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-gray-500 font-medium">All systems normal</p>
                <p className="text-xs text-gray-400 mt-1">No issues detected across the platform</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id}
                    className={`border rounded-xl p-4 flex gap-3 items-start ${SEV_COLOR[alert.severity]}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEV_DOT[alert.severity]}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs mt-0.5 opacity-80">{alert.detail}</p>
                    </div>
                    <span className="text-xs opacity-60 flex-shrink-0">{alert.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MonitorAD;
