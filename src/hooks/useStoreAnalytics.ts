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

interface CategorySales {
  category: string;
  revenue: number;
  unitsSold: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface StoreAnalytics {
  bestSellers: Product[];
  dailyRevenue: DailyRevenue[];
  totalCustomers: number;
  returningCustomers: number;
  newCustomers: number;
  avgOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  statusBreakdown: StatusBreakdown[];
  categorySales: CategorySales[];
  // Week-over-week comparison — genuinely useful context that was
  // completely missing before: a single number ("revenue this week") on
  // its own tells a store nothing about whether they're doing better or
  // worse than usual.
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  revenueChangePercent: number | null;
  thisWeekOrders: number;
  lastWeekOrders: number;
  ordersChangePercent: number | null;
}

const parseAmount = (v: unknown): number => {
  if (typeof v === "number") return v;
  return Number(String(v || "0").replace(/[^0-9.]/g, "")) || 0;
};

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
        const paidOrders = orders.filter((o) => o.paymentStatus === "paid");

        // Best sellers — also tracks category now, needed for the
        // category breakdown below without a second pass over the data.
        const productMap: Record<string, { name: string; sold: number; revenue: number; category?: string }> = {};
        const categoryMap: Record<string, { revenue: number; unitsSold: number }> = {};

        orders.forEach((o) => {
          (o.items || o.products || []).forEach((p: any) => {
            const name = p.itemName || p.name || "Unknown";
            const qty = p.qty || p.quantity || 1;
            const unitPrice = p.unitPrice || p.price || 0;
            const lineRevenue = unitPrice * qty;

            if (!productMap[name]) productMap[name] = { name, sold: 0, revenue: 0 };
            productMap[name].sold += qty;
            productMap[name].revenue += lineRevenue;

            // category isn't always present on the order's item snapshot,
            // so this is a best-effort grouping — falls back to
            // "Uncategorized" rather than silently dropping the line.
            const category = p.category || "Uncategorized";
            if (!categoryMap[category]) categoryMap[category] = { revenue: 0, unitsSold: 0 };
            categoryMap[category].revenue += lineRevenue;
            categoryMap[category].unitsSold += qty;
          });
        });

        const bestSellers = Object.values(productMap)
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5)
          .map((p) => ({ name: p.name, totalSold: p.sold, revenue: p.revenue }));

        const categorySales = Object.entries(categoryMap)
          .map(([category, v]) => ({ category, revenue: v.revenue, unitsSold: v.unitsSold }))
          .sort((a, b) => b.revenue - a.revenue);

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
          const revenue = dayOrders.reduce((s, o) => s + parseAmount(o.subTotal), 0);
          dailyRevenue.push({ date: dateStr, revenue, orders: dayOrders.length });
        }

        // Customer stats — returning customers were previously hardcoded
        // to 0 and never actually calculated. A "returning customer" here
        // means a customer who has placed 2 or more orders with this
        // store, which is the standard way to measure repeat business.
        const customerOrderCounts: Record<string, number> = {};
        orders.forEach((o) => {
          const key = o.customerId || o.name || "unknown";
          customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1;
        });
        const customerIds = Object.keys(customerOrderCounts);
        const returningCustomers = customerIds.filter((id) => customerOrderCounts[id] >= 2).length;
        const newCustomers = customerIds.length - returningCustomers;

        const totalRevenue = paidOrders.reduce((s, o) => s + parseAmount(o.subTotal), 0);

        // Order status breakdown — previously only "pending" and
        // "processing" were tracked, with no visibility into how many
        // orders are out for delivery, delivered, or cancelled.
        const statusCounts: Record<string, number> = {};
        orders.forEach((o) => {
          const s = o.status || "unknown";
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        });
        const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

        // Week-over-week comparison
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        const thisWeekOrders = orders.filter((o) => new Date(o.createdAt) >= oneWeekAgo);
        const lastWeekOrdersList = orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= twoWeeksAgo && d < oneWeekAgo;
        });

        const thisWeekRevenue = thisWeekOrders
          .filter((o) => o.paymentStatus === "paid")
          .reduce((s, o) => s + parseAmount(o.subTotal), 0);
        const lastWeekRevenue = lastWeekOrdersList
          .filter((o) => o.paymentStatus === "paid")
          .reduce((s, o) => s + parseAmount(o.subTotal), 0);

        const revenueChangePercent = lastWeekRevenue > 0
          ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 1000) / 10
          : null; // null (not 0%) when there's no prior-week data to compare against — 0% would falsely imply "no change"

        const ordersChangePercent = lastWeekOrdersList.length > 0
          ? Math.round(((thisWeekOrders.length - lastWeekOrdersList.length) / lastWeekOrdersList.length) * 1000) / 10
          : null;

        setAnalytics({
          bestSellers,
          dailyRevenue,
          totalCustomers: customerIds.length,
          returningCustomers,
          newCustomers,
          avgOrderValue: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          processingOrders: orders.filter((o) => o.status === "processing").length,
          statusBreakdown,
          categorySales,
          thisWeekRevenue,
          lastWeekRevenue,
          revenueChangePercent,
          thisWeekOrders: thisWeekOrders.length,
          lastWeekOrders: lastWeekOrdersList.length,
          ordersChangePercent,
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
