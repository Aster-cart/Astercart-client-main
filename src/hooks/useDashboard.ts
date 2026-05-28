import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

type StoreOrderLine = {
  productId: string;
  name: string;
  price: number;
  adminFee: number;
  storePayout: number;
  createdAt: string;
  status: "pending" | "completed" | "failed" | "canceled";
  quantity?: number;
};

type PaymentProduct = { name: string; price: number; quantity?: number };
type Payment = {
  _id: string;
  amount: number;
  taxRate?: number;
  additionalFee?: number;
  discount?: number;
  storePayout?: number;
  status: string;
  createdAt: string;
  store?: { name?: string };
  products?: PaymentProduct[];
};

type TableRow = {
  id: string;
  user: string;
  transactionId: string;
  productName: string;
  price: string;
  fee: string;
  qty: number;
  discount: string;
  taxRate: string;
  createdAt?: string;
};

type PaymentBreakdown = {
  amount: number;   // == price
  taxRate: number;
  tax: number;
  discount: number;
  fee: number;      // amount - tax - discount
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const formatNum = (n: number) =>
  new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );

export const useDashboard = () => {
  // UI state
  const [selectedFilter, setSelectedFilter] = useState<string>("All Transactions");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [lines, setLines] = useState<StoreOrderLine[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState({ orders: false, payments: false });
  const [error, setError] = useState<string | null>(null);

  const storeId = localStorage.getItem("storeId") || "";
  const storeName = (localStorage.getItem("storeName") || "").trim();

  // Helper: compute consistent breakdown per payment
  const breakdownFromPayment = (p: Payment): PaymentBreakdown => {
    const amount   = Number(p.amount) || 0;
    const taxRate  = Number(p.taxRate) || 0;
    const discount = Number(p.discount) || 0;
    const tax      = (amount * taxRate) / 100;
    const fee      = Math.max(0, amount - tax - discount);
    return { amount, taxRate, tax, discount, fee };
  };

  // fetch store order lines
  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading((s) => ({ ...s, orders: true }));
        const res = await api.get<{ orders: StoreOrderLine[] }>("/store/orders");
        if (!cancelled) {
          const orders = res.data?.orders || [];
          setLines(
            orders.flatMap((o: { items?: { itemName: string; qty: number; unitPrice: number }[]; orderNo?: string; transactionStatus?: string; createdAt?: string; name?: string }) =>
              (o.items || []).map((item) => ({
                productId: o.orderNo || "",
                name: item.itemName,
                price: item.unitPrice,
                adminFee: 0,
                storePayout: item.unitPrice * item.qty,
                createdAt: o.createdAt || new Date().toISOString(),
                status: (o.transactionStatus === "Successful" ? "completed" : "pending") as StoreOrderLine["status"],
                quantity: item.qty,
              }))
            )
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || "Failed to load store orders");
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, orders: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [storeId]);

  // Payment breakdown comes from order lines (store cannot access admin /payment/all)
  useEffect(() => {
    setPayments([]);
    setLoading((s) => ({ ...s, payments: false }));
  }, [storeName]);

  // 1) payments that belong to this store  ⬅ declare FIRST
  const targetPayments = useMemo(() => {
    const nameLower = storeName.toLowerCase();
    const idsFromTable = new Set(lines.map((l) => String(l.productId)).filter(Boolean));
    return payments.filter((p) => {
      const byName = (p.store?.name || "").toLowerCase() === nameLower;
      const byId = idsFromTable.has(String(p._id));
      return byName || byId;
    });
  }, [payments, lines, storeName]);

  // 2) breakdown map per payment id
  const paymentBreakdownById = useMemo(() => {
    const m = new Map<string, PaymentBreakdown>();
    targetPayments.forEach((p) => m.set(String(p._id), breakdownFromPayment(p)));
    return m;
  }, [targetPayments]);

  // 3) table rows from order lines
  const baseRows: TableRow[] = useMemo(() => {
    const rows: TableRow[] = [];
    lines.forEach((l, idx) => {
      const q = l.quantity ? Number(l.quantity) : 1;
      const priceNum = (Number(l.price) || 0) * q;

      const rawUser = (l as any).user;
      const userDisplay = (rawUser && String(rawUser).trim()) || "Unknown";

      const b = paymentBreakdownById.get(String(l.productId));

      const taxFromLine = Number((l as any).taxRate) ? `${Number((l as any).taxRate)}%` : "";
      const taxRateDisplay = b?.taxRate ? `${b.taxRate}%` : taxFromLine;

      const feeForRow = b?.fee ?? 0;

      rows.push({
        id: `${l.productId}-${idx}`,
        user: userDisplay,
        transactionId: (l.productId || String(idx + 1)).slice(0, 8).toUpperCase(),
        productName: l.name || "—",
        price: formatNaira(priceNum),
        fee: formatNaira(feeForRow),
        qty: q,
        discount: formatNaira(0),
        taxRate: taxRateDisplay,
        createdAt: l.createdAt,
      });
    });
    return rows;
  }, [lines, paymentBreakdownById]);

  // 4) filter: recent transactions
  const filteredTransactions = useMemo(() => {
    if (selectedFilter !== "Recent Transaction") return baseRows;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return baseRows.filter(
      (r) => new Date(r.createdAt || 0).getTime() >= sevenDaysAgo
    );
  }, [baseRows, selectedFilter]);

  const totals = useMemo(() => {
    let totalAmount = 0;
    lines.forEach((l) => {
      const q = l.quantity ? Number(l.quantity) : 1;
      totalAmount += (Number(l.price) || 0) * q;
    });
    return {
      totalAmount,
      totalTax: 0,
      totalDiscount: 0,
      leftAfterDeductions: totalAmount,
    };
  }, [lines]);

  // 6) dashboard tiles
  const mockDashboardData = useMemo(() => {
    return {
      transactions: filteredTransactions.length,
      amountMade: formatNaira(totals.totalAmount),
      // Total left AFTER tax and discount (store payout ignored)
      totalFeesCharged: formatNaira(totals.leftAfterDeductions),
    };
  }, [filteredTransactions.length, totals]);

  const mockAllTransactionData = useMemo(() => {
    return { allTransactions: formatNum(baseRows.length) };
  }, [baseRows.length]);

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
  };
};
