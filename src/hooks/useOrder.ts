import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

export interface OrderData {
  _id?: string;
  name: string;
  orderDate: string;
  orderTime: string;
  orderNo: string;
  items: {
    itemName: string;
    qty: number;
    unitPrice: number;
  }[];
  subTotal: string;
  transactionReference: string;
  transactionStatus: string;
  image: string;
  status?: string;
  pickupOTP?: string | null;
  riderId?: string | null;
}

export interface OrderStats {
  totalOrdersSale: string;
  totalCompletedOrders: string;
  totalPendingOrders: string;
  totalFailedOrders: string;
}

export interface AllOrderData {
  allOrder: string;
}

const useOrder = () => {
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrdersSale: "₦0",
    totalCompletedOrders: "₦0",
    totalPendingOrders: "₦0",
    totalFailedOrders: "₦0",
  });
  const [allOrderCount, setAllOrderCount] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Africa/Lagos",
    });
  };

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = useState<OrderData | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const fetchOrders = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.get<{ orders: OrderData[] }>("/store/orders"),
        api.get<OrderStats & { allOrder?: string }>("/store/orders/stats"),
      ]);
      setOrderData(ordersRes.data?.orders || []);
      const stats = statsRes.data;
      setOrderStats({
        totalOrdersSale: stats.totalOrdersSale || "₦0",
        totalCompletedOrders: stats.totalCompletedOrders || "₦0",
        totalPendingOrders: stats.totalPendingOrders || "₦0",
        totalFailedOrders: stats.totalFailedOrders || "₦0",
      });
      setAllOrderCount(stats.allOrder || String(ordersRes.data?.orders?.length || 0));
      setError(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    })();

    // Real polling — previously this effect ran ONCE on mount and never
    // again, meaning a store had no way to discover a rider had accepted
    // their order and was waiting at the counter with a pickup code,
    // short of manually reloading the whole page. 20 seconds is frequent
    // enough to feel responsive without hammering the server; this is a
    // pragmatic interim step before a real websocket-based push system,
    // which would be the more architecturally correct long-term answer
    // but a meaningfully bigger change than this feature needs right now.
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (index: number): void => {
    setActiveDropdown((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleViewReceipt = (order: OrderData): void => {
    setTransactionDetails(order);
    setModalOpen(true);
  };

  const handlePrintReceipt = (): void => {};
  const handleCloseModal = (): void => setModalOpen(false);
  const handlePreviewClick = (item: OrderData) => {
    setSelectedItem(item);
    setShowPreview(true);
  };
  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedItem(null);
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB");
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const toggleRow = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const calculateSubtotal = (items: { unitPrice: number; qty: number }[]) =>
    items.reduce((total, item) => total + item.unitPrice * item.qty, 0);

  return {
    activeDropdown,
    modalOpen,
    transactionDetails,
    selectedItem,
    showPreview,
    expandedRows,
    dropdownRef,
    toggleDropdown,
    handleViewReceipt,
    handlePrintReceipt,
    handleCloseModal,
    handlePreviewClick,
    handleClosePreview,
    toggleRow,
    calculateSubtotal,
    formatDate,
    formattedDate,
    formattedTime,
    mockOrderData: orderStats,
    mockAllOrderData: { allOrder: allOrderCount },
    mockDataOrder: orderData,
    loading,
    error,
  };
};

export default useOrder;
