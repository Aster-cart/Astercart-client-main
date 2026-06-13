import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

type Order = {
  _id?: string;
  orderNo?: string;
  name?: string;          // customer name
  status?: string;
  transactionStatus?: string;
  paymentStatus?: string;
  subTotal?: string | number;
  items?: { itemName: string; qty: number; unitPrice: number }[];
  createdAt?: string;
  storeName?: string;
  storeId?: string;
  deliveryAddress?: { address?: string; state?: string; lga?: string };
};

type TableRow = {
  id: string;
  user: string;
  transactionId: string;
  orderNo: string;
  amount: string;
  status: string;
  paymentStatus: string;
  itemCount: number;
  createdAt?: string;
  storeName?: string;
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

const formatNum = (n: number) =>
  new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round(n || 0));

export const useDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Transactions");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState({ orders: false, payments: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      setLoading((s) => ({ ...s, orders: true }));
      try {
        const res = await api.get<{ orders: Order[] }>("/store/orders");
        setOrders(res.data?.orders || []);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading((s) => ({ ...s, orders: false }));
      }
    })();
  }, []);

  // One row per ORDER not per product
  const baseRows: TableRow[] = useMemo(() =>
    orders.map((o) => {
      const status = o.transactionStatus?.toLowerCase() === "successful"
        ? "completed"
        : (o.status || "pending");
      const payStatus = o.paymentStatus || (status === "completed" ? "paid" : "unpaid");
      const amount = typeof o.subTotal === "number"
        ? formatNaira(o.subTotal)
        : o.subTotal || "₦0";
      return {
        id: o._id || o.orderNo || "",
        user: o.name || "Customer",
        transactionId: (o._id || "").slice(-8).toUpperCase(),
        orderNo: (o.orderNo || o._id || "").slice(0, 10).toUpperCase(),
        amount,
        status,
        paymentStatus: payStatus,
        itemCount: o.items?.length || 0,
        createdAt: o.createdAt,
        storeName: o.storeName,
      };
    }),
  [orders]);

  // Stats — calculated from real orders
  const stats = useMemo(() => {
    const completed = orders.filter((o) =>
      o.status === "completed" || o.transactionStatus?.toLowerCase() === "successful"
    );
    const pending = orders.filter((o) =>
      !["completed", "failed", "canceled"].includes(o.status || "") &&
      o.transactionStatus?.toLowerCase() !== "successful"
    );
    const failed = orders.filter((o) =>
      o.status === "failed" || o.status === "canceled"
    );

    const parseAmt = (v: string | number | undefined) => {
      if (!v) return 0;
      if (typeof v === "number") return v;
      return Number(String(v).replace(/[^0-9.]/g, "")) || 0;
    };

    const totalRevenue = orders.reduce((s, o) => s + parseAmt(o.subTotal), 0);
    const completedRevenue = completed.reduce((s, o) => s + parseAmt(o.subTotal), 0);
    const pendingRevenue = pending.reduce((s, o) => s + parseAmt(o.subTotal), 0);
    const failedRevenue = failed.reduce((s, o) => s + parseAmt(o.subTotal), 0);

    return {
      totalOrdersSale: formatNaira(totalRevenue),
      totalCompletedOrders: formatNaira(completedRevenue),
      totalPendingOrders: formatNaira(pendingRevenue),
      totalFailedOrders: formatNaira(failedRevenue),
    };
  }, [orders]);

  const filteredTransactions = useMemo(() => {
    let rows = baseRows;
    if (selectedFilter === "Recent Transaction") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      rows = rows.filter((r) => new Date(r.createdAt || 0).getTime() >= sevenDaysAgo);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.user.toLowerCase().includes(q) ||
          r.transactionId.toLowerCase().includes(q) ||
          r.orderNo.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [baseRows, selectedFilter, searchQuery]);

  // Dashboard tiles — financial summary
  const mockDashboardData = useMemo(() => {
    const parseAmt = (v: string | number | undefined) => {
      if (!v) return 0;
      if (typeof v === "number") return v;
      return Number(String(v).replace(/[^0-9.]/g, "")) || 0;
    };
    const gross = orders
      .filter((o) => o.status === "completed" || o.paymentStatus === "paid")
      .reduce((s, o) => s + parseAmt(o.subTotal), 0);
    const payout = Math.round(gross * 0.9);
    const fee = Math.round(gross * 0.1);

    return {
      transactions: orders.length,
      amountMade: formatNaira(gross),
      totalFeesCharged: formatNaira(payout),
      platformFee: formatNaira(fee),
    };
  }, [orders]);

  const mockAllTransactionData = useMemo(() => ({
    allTransactions: formatNum(baseRows.length),
  }), [baseRows.length]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  return {
    mockDashboardData,
    mockAllTransactionData,
    filteredTransactions,
    selectedFilter,
    setSelectedFilter,
    isOpen,
    setIsOpen,
    searchQuery,
    handleSearchChange,
    loading,
    error,
    mockOrderData: stats,
    mockAllOrderData: { allOrder: String(orders.length) },
    mockDataOrder: orders,
  };
};
