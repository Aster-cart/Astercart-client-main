import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useAuthStore } from "../store/authStore";
import { playNotificationSound } from "../utils/playNotificationSound";
import { resolveStoreNotificationDestination } from "../utils/notificationDestination";
import usePickupCodes, { isAwaitingPickup } from "./usePickupCodes";

interface OrderBrief {
  _id?: string;
  orderNo: string;
  name: string;
  createdAt: string;
  status?: string;
  riderId?: string | null;
}

interface ServerNotif {
  _id: string;
  title: string;
  message: string;
  type?: string;
  referenceId?: string | null;
  referenceModel?: string | null;
  seen?: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  _id?: string; // server notification id — present for server-sourced notifs
  title?: string;
  message: string;
  read: boolean;
  timestamp: string;
  type?: string; // "order" | "pickup_otp" | "verification" | ...
  orderId?: string; // used to track when a pickup_otp notification should disappear
  referenceId?: string;
  referenceModel?: string;
  source?: "server" | "client";
}

/**
 * useNotification.ts
 *
 * STORE dashboard notifications, built from two sources:
 *  1. Server-side notifications for the store (role: "store") fetched from
 *     GET /store/notifications — the authoritative record of events that
 *     happened even when the dashboard tab was closed (new paid orders,
 *     verification approved/rejected, …). Each carries type + referenceId
 *     so the UI can navigate to the right page on click.
 *  2. Pickup OTP notifications generated locally for orders currently
 *     waiting on a pickup confirmation.
 *
 * Polls every 15 seconds, fires a real browser notification for NEW pickup
 * orders (Web Notifications API), and keeps "read" state stable across polls.
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const previousPickupOrderIds = useRef<Set<string>>(new Set());
  const [orders, setOrders] = useState<OrderBrief[]>([]);
  const pickupCodes = usePickupCodes(orders);
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
      const storeProfile = useAuthStore.getState().storeProfile;
      const prefs = storeProfile?.notificationPreferences;

      const [ordersRes, serverNotifsRes] = await Promise.all([
        api.get<{ orders: OrderBrief[] }>("/store/orders"),
        api.get<{ notifications?: ServerNotif[] }>("/store/notifications").catch(() => ({ data: { notifications: [] } })),
      ]);

      const orders = ordersRes.data?.orders || [];
      setOrders(orders);

      const serverNotifs = serverNotifsRes.data?.notifications || [];
      const showOrderNotifs = prefs?.newOrder !== false;

      // Server-sourced notifications (authoritative). Client-side order
      // notifications are no longer generated — the server's "New Paid
      // Order" records already cover them and carry a real referenceId.
      const serverNotifsMapped: Notification[] = serverNotifs.map((n) => ({
        id: `srv-${n._id}`,
        _id: n._id,
        title: n.title,
        message: n.message,
        read: !!n.seen,
        timestamp: n.createdAt,
        type: n.type || "general",
        orderId: n.referenceModel === "Transaction" ? (n.referenceId || undefined) : undefined,
        referenceId: n.referenceId || undefined,
        referenceModel: n.referenceModel || undefined,
        source: "server" as const,
      }));
      const serverOrderNotifs = showOrderNotifs
        ? serverNotifsMapped
        : serverNotifsMapped.filter((n) => n.type !== "order");

      // Pickup OTP notifications — one per order currently waiting on a
      // pickup confirmation.
      const pickupOrders = orders.filter(isAwaitingPickup);
      const pickupNotifs: Notification[] = pickupOrders.map(o => ({
        id: `pickup-${o._id || o.orderNo}`,
        message: `Rider waiting at pickup for order #${(o.orderNo || "").slice(0, 8).toUpperCase()} — code ${pickupCodes[o._id || ""] || "…"}`,
        read: false,
        timestamp: new Date().toISOString(),
        type: "pickup_otp" as const,
        orderId: o._id || o.orderNo,
        source: "client" as const,
      }));

      // Fire a real browser notification for any NEW pickup order since
      // the last check.
      if (!isFirstLoad) {
        for (const o of pickupOrders) {
          const orderKey = o._id || o.orderNo;
          if (!previousPickupOrderIds.current.has(orderKey)) {
            fireBrowserNotification(
              "Rider waiting for pickup",
              `Order #${(o.orderNo || "").slice(0, 8).toUpperCase()} — pickup code ${pickupCodes[o._id || ""] || "…"}`
            );
          }
        }
      }
      previousPickupOrderIds.current = new Set(pickupOrders.map(o => o._id || o.orderNo));

      setNotifications(prev => {
        const prevReadMap = new Map(prev.map(n => [n.id, n.read]));
        const merged = [...pickupNotifs, ...serverOrderNotifs].map(n => ({
          ...n,
          read: prevReadMap.get(n.id) ?? n.read,
        }));
        // Play audio + show toast popup for new unread notifications
        if (!isFirstLoad) {
          const newUnread = merged.filter(n => !n.read && !prevReadMap.has(n.id));
          for (const n of newUnread) {
            playNotificationSound();
            const title = n.title || (n.type === "pickup_otp" ? "Rider at pickup!" : "New Order");
            const dest = resolveStoreNotificationDestination(n);
            toast.info(
              <div style={{ cursor: "pointer" }} onClick={() => { window.location.href = dest; }}>
                <strong>{title}</strong>
                <p style={{ fontSize: 13, margin: "4px 0 0" }}>{n.message}</p>
              </div>,
              { autoClose: 8000, onClick: () => { window.location.href = dest; } }
            );
          }
        }
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
    const interval = setInterval(() => load(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotificationModal = (force?: boolean) => setShowNotificationModal((prev) => force ?? !prev);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const n = notifications.find((x) => x.id === id);
    if (n?.source === "server" && n._id) {
      api.put(`/store/notifications/${n._id}/read`).catch(() => {});
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.filter((n) => n.source === "server" && !n.read && n._id).forEach((n) => {
      api.put(`/store/notifications/${n._id}/read`).catch(() => {});
    });
  };

  const formatToTodayTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "pm" : "am";
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const prefix = isToday ? "Today" : isYesterday ? "Yesterday" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${prefix} at ${hours}:${minutes} ${ampm}`;
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
