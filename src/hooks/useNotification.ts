import { useEffect, useState, useRef } from "react";
import api from "../utils/api";

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
  type?: "order" | "pickup_otp";
  orderId?: string; // used to track when a pickup_otp notification should disappear
}

/**
 * useNotification.ts
 *
 * PREVIOUSLY: loaded once on mount, built generic "order received"
 * entries only — no concept of a pickup OTP at all, and no real way for
 * a store to be alerted to anything happening while the dashboard tab
 * wasn't open or focused.
 *
 * NOW: polls every 15 seconds (matching the urgency of a rider standing
 * at the counter), generates a dedicated pickup_otp notification the
 * moment a rider accepts an order, and fires a REAL browser
 * notification via the Web Notifications API — the correct, standard
 * technology for alerting someone even when the browser tab isn't
 * focused or visible. This is genuinely different from Expo push
 * notifications (used for the mobile apps), which have no path to a
 * browser at all — a website cannot receive an Expo push notification,
 * so this had to be built as real browser notifications instead, a
 * separate piece of infrastructure.
 *
 * Browser notifications require the user's explicit, one-time
 * permission — handled via requestNotificationPermission() below, which
 * should be called from a real user interaction (e.g. a button), not
 * silently on page load, since browsers increasingly block or ignore
 * permission requests that aren't tied to a genuine user gesture.
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const previousPickupOrderIds = useRef<Set<string>>(new Set());

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  };

  const fireBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      const n = new Notification(title, { body, icon: "/favicon.ico", tag: "astercart-pickup" });
      n.onclick = () => { window.focus(); n.close(); };
    } catch {
      // Some browsers throw if called from a background tab without a
      // service worker — never let a notification failure break the
      // dashboard itself.
    }
  };

  const load = async (isFirstLoad: boolean) => {
    try {
      const ordersRes = await api.get<{
        orders: {
          orderNo: string; _id?: string; name: string; transactionStatus: string;
          createdAt: string; status?: string; pickupOTP?: string | null; riderId?: string | null;
        }[];
      }>("/store/orders");

      const orders = ordersRes.data?.orders || [];

      const orderNotifs: Notification[] = orders.slice(0, 10).map((o, i) => ({
        id: o.orderNo || String(i),
        message: `Order received: ${o.name || "A customer"} placed order #${(o.orderNo || "").slice(0, 8).toUpperCase()}`,
        read: false,
        timestamp: o.createdAt || new Date().toISOString(),
        type: "order" as const,
      }));

      // Pickup OTP notifications — one per order currently waiting on a
      // pickup confirmation. These are tracked separately from generic
      // order notifications so they can be programmatically removed the
      // instant the order moves past "processing" (i.e. once the rider
      // and store have both confirmed and the order is out for
      // delivery) — see the filter below the merge.
      const pickupOrders = orders.filter(o => o.pickupOTP && o.riderId && o.status === "processing");
      const pickupNotifs: Notification[] = pickupOrders.map(o => ({
        id: `pickup-${o._id || o.orderNo}`,
        message: `Rider waiting at pickup for order #${(o.orderNo || "").slice(0, 8).toUpperCase()} — code ${o.pickupOTP}`,
        read: false,
        timestamp: new Date().toISOString(),
        type: "pickup_otp" as const,
        orderId: o._id || o.orderNo,
      }));

      // Fire a real browser notification for any NEW pickup order since
      // the last check — not on first load (that would fire a
      // notification for every order already waiting when the page
      // happens to load, which is correct information but not a "new"
      // event), and not repeatedly for the same order on every poll.
      if (!isFirstLoad) {
        for (const o of pickupOrders) {
          const orderKey = o._id || o.orderNo;
          if (!previousPickupOrderIds.current.has(orderKey)) {
            fireBrowserNotification(
              "Rider waiting for pickup",
              `Order #${(o.orderNo || "").slice(0, 8).toUpperCase()} — pickup code ${o.pickupOTP}`
            );
          }
        }
      }
      previousPickupOrderIds.current = new Set(pickupOrders.map(o => o._id || o.orderNo));

      // Merge — pickup notifications first (more time-sensitive), then
      // regular order notifications. Preserve "read" state for
      // notifications that already existed across this poll, rather
      // than resetting everything to unread every 15 seconds.
      setNotifications(prev => {
        const prevReadMap = new Map(prev.map(n => [n.id, n.read]));
        const merged = [...pickupNotifs, ...orderNotifs].map(n => ({
          ...n,
          read: prevReadMap.get(n.id) ?? n.read,
        }));
        return merged;
      });
    } catch {
      // silently fail — notifications are non-critical, never block the
      // rest of the dashboard over this
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    load(true);
    // 15-second polling — pickup notifications are genuinely
    // time-sensitive (a rider physically waiting at the counter), so
    // this polls more frequently than the 20-second interval used for
    // the main Orders page table itself.
    const interval = setInterval(() => load(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotificationModal = () => setShowNotificationModal((prev) => !prev);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
    requestNotificationPermission,
  };
};
