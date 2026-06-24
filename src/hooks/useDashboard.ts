import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

type Order = {
  _id?: string;
  orderNo?: string;
  name?: string;          // customer name
  status?: string;
  transactionStatus?: string;
  paymentStatus?: string;
  payoutStatus?: string;
  paidOutAt?: string | null;
  subTotal?: string | number;
  // Authoritative fee breakdown, read directly from the server — these are
  // never recomputed on the frontend. Recomputing independently here was
  // exactly what caused this dashboard to show different numbers than the
  // admin dashboard for the same order.
  totalAmount?: number;        // product subtotal only
  deliveryFee?: number;
  serviceFee?: number;
  platformCommission?: number;
  storePayout?: number;
  grandTotal?: number;
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
  payoutStatus: string;
  paidOutAt: string | null;
  itemCount: number;
  createdAt?: string;
  storeName?: string;
  // Raw numbers (not pre-formatted strings) so Earnings.tsx and any other
  // consumer can do its own display formatting without losing precision,
  // while still only ever reading values the server already calculated.
  deliveryFee: number;
  serviceFee: number;
  platformCommission: number;
  storePayout: number;
  grandTotal: number;
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
      // paymentStatus must be the single, honest source of truth — NEVER
      // inferred from order status. An order can legitimately be marked
      // "completed" by a store while still being unpaid (e.g. leftover test
      // data, or a cash-on-delivery style flow). Previously this silently
      // treated any "completed" order as "paid" even when the real database
      // field said otherwise, which is what caused revenue figures to
      // include orders that were never actually paid for.
      const payStatus = o.paymentStatus || "unpaid";
      const amount = typeof o.subTotal === "number"
        ? formatNaira(o.subTotal)
        : o.subTotal || "₦0";
      // Use the SAME slicing convention as the admin dashboard (last 8 chars)
      // so the same order shows the same reference number everywhere.
      const idTail = (o._id || "").slice(-8).toUpperCase();
      return {
        id: o._id || o.orderNo || "",
        user: o.name || "Customer",
        transactionId: idTail,
        orderNo: idTail,
        amount,
        status,
        paymentStatus: payStatus,
        payoutStatus: o.payoutStatus || "pending",
        paidOutAt: o.paidOutAt || null,
        itemCount: o.items?.length || 0,
        createdAt: o.createdAt,
        storeName: o.storeName,
        // Pass through the real, already-correct numbers from the server —
        // never recomputed here.
        deliveryFee: o.deliveryFee || 0,
        serviceFee: o.serviceFee || 0,
        platformCommission: o.platformCommission || 0,
        storePayout: o.storePayout != null ? o.storePayout : (o.totalAmount || 0),
        grandTotal: o.grandTotal || o.totalAmount || 0,
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
  // Every figure here is SUMMED from real per-order values the server
  // already calculated correctly (platformCommission, storePayout, etc.)
  // — never recomputed as a flat 90/10 split. The previous version did
  // exactly that (gross * 0.9, gross * 0.1), which silently ignored
  // per-store fee overrides and any delivery/service fee distinction,
  // and is the reason this dashboard could show different numbers than
  // the admin dashboard for the exact same orders.
  const mockDashboardData = useMemo(() => {
    const parseAmt = (v: string | number | undefined) => {
      if (!v) return 0;
      if (typeof v === "number") return v;
      return Number(String(v).replace(/[^0-9.]/g, "")) || 0;
    };
    // Only count orders where payment is confirmed — paymentStatus is the
    // single source of truth.
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");

    const gross = paidOrders.reduce((s, o) => s + parseAmt(o.totalAmount ?? o.subTotal), 0);
    const payout = paidOrders.reduce((s, o) => s + (o.storePayout ?? parseAmt(o.totalAmount ?? o.subTotal)), 0);
    const fee = paidOrders.reduce((s, o) => s + (o.platformCommission || 0), 0);

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
