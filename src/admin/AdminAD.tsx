import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Aster, dashboard, logout as logoutIcon, setting, dash, log, set,
  down, storem, userm, orderm, wallet, stom, usem, ordm, walet,
} from "../assets/res";
import { IoNotificationsOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import DashboardAD from "./DashboardAD";
import StoresAD from "./StoresAD";
import UsersAD from "./UsersAD";
import OrdersAD from "./OrdersAD";
import PaymentAD from "./PaymentAD";
import SettingsAD from "./SettingsAD";
import SupportAD from "./SupportAD";
import AnalyticsAD from "./AnalyticsAD";
import RevenueAD from "./RevenueAD";
import DisputesAD from "./DisputesAD";
import TeamAD from "./TeamAD";
import PayoutsAD from "./PayoutsAD";
import MonitorAD from "./MonitorAD";
import RidersAD from "./RidersAD";
import { useAdminAuthStore } from "../store/adminAuthStore";
import ProductsAD from "./ProductsAD";
import PricingAD from "./PricingAD";
import FinancialLedgerAD from "./FinancialLedgerAD";
import WithdrawalsAD from "./WithdrawalsAD";
import AuditLogsAD from "./AuditLogsAD";
import api from "../utils/api";
import { playNotificationSound } from "../utils/playNotificationSound";

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  seen: boolean;
}

// ── Admin header with real notifications ─────────────────────────
const AdminHeader: React.FC<{ title: string }> = ({ title }) => {
  const admin = useAdminAuthStore((s) => s.admin);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const prevIds = useRef<Set<string>>(new Set());

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get<{ notifications?: Notification[] }>("/admin/notifications");
      const list = data.notifications || [];
      setNotifications(list.slice(0, 20));
      // Play sound + show toast popup for new unseen notifications
      const newOnes = list.filter((n) => !n.seen && !prevIds.current.has(n._id));
      for (const n of newOnes) {
        playNotificationSound();
        toast.info(
          <div style={{ cursor: "pointer" }} onClick={() => { window.location.href = "/admin"; }}>
            <strong>{n.title}</strong>
            <p style={{ fontSize: 13, margin: "4px 0 0" }}>{n.message}</p>
          </div>,
          { autoClose: 8000, onClick: () => { window.location.href = "/admin"; } }
        );
      }
      prevIds.current = new Set(list.map((n) => n._id));
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, seen: true } : n));
    try { await api.patch(`/admin/read/${id}`); } catch { /* silent */ }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    try { await api.patch("/admin/mark-all-read"); } catch { /* silent */ }
  };

  const unreadCount = notifications.filter((n) => !n.seen).length;
  const allRead = notifications.every((n) => n.seen);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    const ap = d.getHours() >= 12 ? "pm" : "am";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const prefix = isToday ? "Today" : isYesterday ? "Yesterday" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${prefix} at ${h}:${m} ${ap}`;
  };

  return (
    <div className="flex justify-between font-inter items-center py-2 w-full h-[56px] px-4 md:px-6 bg-white border-b border-border">
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <div className="flex space-x-4 items-center">
        {/* Bell */}
        <button onClick={() => setShowModal((p) => !p)} className="relative bg-pry rounded-full p-2">
          <IoNotificationsOutline className="text-xl text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-1 left-4 bg-[#FFEBB2] text-pry text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showModal && (
          <div className="absolute top-14 right-4 z-50 bg-white shadow-xl rounded-xl p-4 w-[380px] border border-border">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-space font-bold text-ink">Notifications</h3>
                <p className="text-sm text-muted">{allRead ? "Read" : "Unread"}</p>
                <img src={down} alt="" />
              </div>
              <button onClick={markAllAsRead} className="text-xs text-pry font-medium hover:underline">Mark all as read</button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No notifications.</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n._id} onClick={() => markAsRead(n._id)} className={`border-b border-border pb-2 cursor-pointer ${n.seen ? "opacity-60" : ""}`}>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="text-sm text-body">{n.message}</p>
                    {!n.seen && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(n._id); navigate("/admin"); }}
                        className="text-xs text-white bg-pry hover:bg-orange-600 transition-colors px-2 py-1 rounded mt-1"
                      >
                        View
                      </button>
                    )}
                    <p className="text-xs text-muted mt-1">{formatTime(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowModal(false)} className="text-xs mt-3 text-pry font-medium hover:underline">Close</button>
          </div>
        )}

        {/* Admin profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pry flex items-center justify-center text-white font-bold text-sm">
            {(admin?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{admin?.email?.split("@")[0] || "Admin"}</p>
            <p className="text-xs text-muted">{admin?.email || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminAD layout ───────────────────────────────────────────
const AdminAD: React.FC = () => {
  const adminLogout = useAdminAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const { restoreSession } = useAdminAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  const allMenuItems = [
    { label: "Dashboard", icon: dashboard, activeIcon: dash },
    { label: "Monitor", icon: dashboard, activeIcon: dash },
    { label: "StoreManagement", icon: storem, activeIcon: stom },
    { label: "UserManagement", icon: userm, activeIcon: usem },
    { label: "Orders", icon: orderm, activeIcon: ordm },
    { label: "Payment", icon: wallet, activeIcon: walet },
    { label: "Withdrawals", icon: wallet, activeIcon: walet },
    { label: "Payouts", icon: wallet, activeIcon: walet },
    // New tab: the three-ledger financial dashboard (Commercial / Cash /
    // Profit views) — sits alongside Payment and Payouts rather than
    // replacing either of them, since this is a different lens on the
    // same underlying data, not a replacement page.
    { label: "FinancialLedger", icon: wallet, activeIcon: walet },
    { label: "Revenue", icon: wallet, activeIcon: walet },
    { label: "Products", icon: storem, activeIcon: stom },
    { label: "Pricing", icon: storem, activeIcon: stom },
    { label: "Settings", icon: setting, activeIcon: set },
    { label: "Analytics", icon: set, activeIcon: set },
    { label: "Disputes", icon: set, activeIcon: set },
    { label: "Riders", icon: set, activeIcon: set },
    { label: "Team", icon: set, activeIcon: set },
    { label: "AuditLogs", icon: set, activeIcon: set },
    { label: "Support", icon: set, activeIcon: set },
    { label: "Logout", icon: logoutIcon, activeIcon: log },
  ];

  const menuItems = allMenuItems;

  const handleMenuClick = (label: string) => {
    if (label === "Logout") { adminLogout(); navigate("/admin/login"); return; }
    setActiveMenu(label);
  };

  const contentMap: Record<string, { title: string; content: React.ReactNode }> = {
    Dashboard: { title: "Dashboard", content: <DashboardAD /> },
    Monitor: { title: "System Monitor", content: <MonitorAD /> },
    StoreManagement: { title: "Store Management", content: <StoresAD /> },
    UserManagement: { title: "Customers", content: <UsersAD /> },
    Orders: { title: "Orders", content: <OrdersAD /> },
    Payment: { title: "Payments", content: <PaymentAD /> },
    Withdrawals: { title: "Withdrawal Requests", content: <WithdrawalsAD /> },
    Payouts: { title: "Payouts & Settlement", content: <PayoutsAD /> },
    FinancialLedger: { title: "Financial Ledger", content: <FinancialLedgerAD /> },
    Revenue: { title: "Revenue", content: <RevenueAD /> },
    Products: { title: "Product Management", content: <ProductsAD /> },
    Pricing: { title: "Pricing & Markup", content: <PricingAD /> },
    Settings: { title: "Settings", content: <SettingsAD /> },
    Analytics: { title: "Analytics", content: <AnalyticsAD /> },
    Disputes: { title: "Disputes", content: <DisputesAD /> },
    Riders: { title: "Riders", content: <RidersAD /> },
    Team: { title: "Admin Team", content: <TeamAD /> },
    AuditLogs: { title: "Audit Logs", content: <AuditLogsAD /> },
    Support: { title: "Support", content: <SupportAD /> },
  };

  const current = contentMap[activeMenu] || contentMap["Dashboard"];

  return (
    <div className="flex h-screen font-inter">
      <aside className="w-[70px] md:w-[250px] flex-shrink-0 bg-ink p-2 md:p-4 fixed h-full overflow-y-auto z-20">
        <div className="flex items-center border-b border-white/10 mb-6 pb-4 px-2 md:px-4">
          <img src={Aster} alt="Logo" className="w-6 h-6 md:w-8 md:h-8 mr-2 brightness-0 invert" />
          <h1 className="hidden md:block text-lg font-bold text-white">Aster<span className="text-pry">Cart</span></h1>
        </div>
        <nav>
          <h2 className="text-xs font-medium mb-4 hidden md:block text-white/40 uppercase tracking-wider">Main Menu</h2>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => handleMenuClick(item.label)}
                  className={`flex items-center w-full px-2 py-2.5 md:px-4 rounded-lg transition-all ${activeMenu === item.label ? "bg-pry text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                >
                  <img src={activeMenu === item.label ? item.activeIcon : item.icon} alt={item.label} className="w-4 h-4 mr-2 brightness-0 invert opacity-60" />
                  <span className="hidden md:inline text-sm font-medium">
                    {item.label === "FinancialLedger"
                      ? "Financial Ledger"
                      : item.label === "AuditLogs"
                        ? "Audit Logs"
                        : item.label.replace("Management", " Mgmt")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="ml-[70px] md:ml-[250px] w-full h-full pb-4 overflow-y-auto bg-off-white">
        <AdminHeader title={current.title} />
        <div className="flex flex-col px-5 pt-4">
          {current.content}
        </div>
      </main>
    </div>
  );
};

export default AdminAD;
