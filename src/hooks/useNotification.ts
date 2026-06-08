import { useEffect, useState } from "react";
import api from "../utils/api";

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch latest orders and build notifications from them
        const [ordersRes] = await Promise.all([
          api.get<{ orders: { orderNo: string; name: string; transactionStatus: string; createdAt: string }[] }>(
            "/store/orders"
          ),
        ]);

        const orders = ordersRes.data?.orders || [];

        // Build a notification for each recent order
        const orderNotifs: Notification[] = orders.slice(0, 10).map((o, i) => ({
          id: o.orderNo || String(i),
          message: `Order received: ${o.name || "A customer"} placed order #${(o.orderNo || "").slice(0, 8).toUpperCase()}`,
          read: false,
          timestamp: o.createdAt || new Date().toISOString(),
        }));

        setNotifications(orderNotifs);
      } catch {
        // silently fail — notifications are non-critical
        setNotifications([]);
      }
    };

    const token = localStorage.getItem("token");
    if (token) load();
  }, []);

  const toggleNotificationModal = () =>
    setShowNotificationModal((prev) => !prev);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatToTodayTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "pm" : "am";
    return `Today at ${hours}:${minutes} ${ampm}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allRead = notifications.every((n) => n.read);

  return {
    notifications,
    showNotificationModal,
    toggleNotificationModal,
    markAsRead,
    markAllAsRead,
    formatToTodayTime,
    unreadCount,
    allRead,
  };
};
