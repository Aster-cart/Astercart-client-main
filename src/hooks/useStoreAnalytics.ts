import { useEffect, useState } from "react";
import api from "../utils/api";

interface Product {
  name: string;
  totalSold: number;
  revenue: number;
  images?: string[];
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface StoreAnalytics {
  bestSellers: Product[];
  dailyRevenue: DailyRevenue[];
  totalCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
}

export const useStoreAnalytics = () => {
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get<{ orders: any[] }>("/store/orders");
        const orders = data.orders || [];

        // Best sellers - count from order products
        const productMap: Record<string, { name: string; sold: number; revenue: number }> = {};
        orders.forEach((o) => {
          (o.items || o.products || []).forEach((p: any) => {
            const name = p.itemName || p.name || "Unknown";
            if (!productMap[name]) productMap[name] = { name, sold: 0, revenue: 0 };
            productMap[name].sold += p.qty || p.quantity || 1;
            productMap[name].revenue += (p.unitPrice || p.price || 0) * (p.qty || p.quantity || 1);
          });
        });
        const bestSellers = Object.values(productMap)
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5)
          .map((p) => ({ name: p.name, totalSold: p.sold, revenue: p.revenue }));

        // Daily revenue - last 7 days
        const now = new Date();
        const dailyRevenue: DailyRevenue[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" });
          const dayOrders = orders.filter((o) => {
            const od = new Date(o.createdAt);
            return od.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" }) === dateStr;
          });
          const revenue = dayOrders.reduce((s, o) => {
            const amt = typeof o.subTotal === "number" ? o.subTotal :
              Number(String(o.subTotal || "0").replace(/[^0-9.]/g, "")) || 0;
            return s + amt;
          }, 0);
          dailyRevenue.push({ date: dateStr, revenue, orders: dayOrders.length });
        }

        // Customer stats
        const customerIds = new Set(orders.map((o) => o.customerId || o.customerName));
        const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
        const totalRevenue = paidOrders.reduce((s, o) => {
          const amt = typeof o.subTotal === "number" ? o.subTotal :
            Number(String(o.subTotal || "0").replace(/[^0-9.]/g, "")) || 0;
          return s + amt;
        }, 0);

        setAnalytics({
          bestSellers,
          dailyRevenue,
          totalCustomers: customerIds.size,
          returningCustomers: 0,
          avgOrderValue: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          processingOrders: orders.filter((o) => o.status === "processing").length,
        });
      } catch {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { analytics, loading };
};
