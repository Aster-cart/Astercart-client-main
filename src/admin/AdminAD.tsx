import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Aster, dashboard, logout as logoutIcon, setting, dash, log, set,
  down, outline, storem, userm, orderm, wallet, stom, usem, ordm, walet,
} from "../assets/res";
import { IoNotificationsOutline } from "react-icons/io5";
import DashboardAD from "./DashboardAD";
import StoresAD from "./StoresAD";
import UsersAD from "./UsersAD";
import OrdersAD from "./OrdersAD";
import PaymentAD from "./PaymentAD";
import SettingsAD from "./SettingsAD";
import SupportAD from "./SupportAD";
import AnalyticsAD from "./AnalyticsAD";
import DisputesAD from "./DisputesAD";
import TeamAD from "./TeamAD";
import PayoutsAD from "./PayoutsAD";
import MonitorAD from "./MonitorAD";
import RidersAD from "./RidersAD";
import { useAdminAuthStore, canAccess } from "../store/adminAuthStore";
import ProductsAD from "./ProductsAD";
import PricingAD from "./PricingAD";
import api from "../utils/api";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// ── Admin header with real notifications ─────────────────────────
const AdminHeader: React.FC<{ title: string }> = ({ title }) => {
  const admin = useAdminAuthStore((s) => s.admin);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ orders?: { _id: string; customerName?: string; createdAt: string }[] }>(
          "/adminOrder"
        );
        const orders = Array.isArray(data) ? data : data.orders || [];
        setNotifications(
          orders.slice(0, 10).map((o) => ({
            id: o._id,
            message: `New order from ${o.customerName || "a customer"}`,
            read: false,
            timestamp: o.createdAt,
          }))
        );
      } catch { setNotifications([]); }
    })();
  }, []);

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;
  const allRead = notifications.every((n) => n.read);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    const ap = d.getHours() >= 12 ? "pm" : "am";
    return `${h}:${m} ${ap}`;
  };

  return (
    <div className="flex justify-between font-inter items-center py-2 w-full h-[50px] px-4 bg-white">
      <h1 className="text-lg font-semibold">{title}</h1>
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
          <div className="absolute top-12 right-20 z-50 bg-white shadow-lg rounded-lg p-4 w-[380px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <p className="text-sm text-[#9EA0AA]">{allRead ? "Read" : "Unread"}</p>
                <img src={down} alt="" />
              </div>
              <div className="flex items-center gap-2">
                <p onClick={markAllAsRead} className="text-sm cursor-pointer">Mark all as read</p>
                <img onClick={markAllAsRead} src={outline} alt="" className="cursor-pointer" />
              </div>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No notifications.</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} onClick={() => markAsRead(n.id)} className={`border-b pb-2 cursor-pointer ${n.read ? "text-gray-400" : "text-black"}`}>
                    <p className="text-sm">{n.message}</p>
                    {!n.read && <button className="text-xs text-white bg-pry px-2 py-1 rounded mt-1">View</button>}
                    <p className="text-xs text-gray-400 mt-1">{formatTime(n.timestamp)}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowModal(false)} className="text-xs mt-3 text-red-500">Close</button>
          </div>
        )}

        {/* Admin profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pry flex items-center justify-center text-white font-bold text-sm">
            {(admin?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{admin?.email?.split("@")[0] || "Admin"}</p>
            <p className="text-xs text-gray-500">{admin?.email || ""}</p>
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

  const { admin, restoreSession } = useAdminAuthStore();

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
    { label: "Payouts", icon: wallet, activeIcon: walet },
    { label: "Products", icon: storem, activeIcon: stom },
    { label: "Pricing", icon: storem, activeIcon: stom },
    { label: "Settings", icon: setting, activeIcon: set },
    { label: "Analytics", icon: set, activeIcon: set },
    { label: "Disputes", icon: set, activeIcon: set },
    { label: "Riders", icon: set, activeIcon: set },
    { label: "Team", icon: set, activeIcon: set },
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
    Payouts: { title: "Payouts & Settlement", content: <PayoutsAD /> },
    Products: { title: "Product Management", content: <ProductsAD /> },
    Pricing: { title: "Pricing & Markup", content: <PricingAD /> },
    Settings: { title: "Settings", content: <SettingsAD /> },
    Analytics: { title: "Analytics", content: <AnalyticsAD /> },
    Disputes: { title: "Disputes", content: <DisputesAD /> },
    Riders: { title: "Riders", content: <RidersAD /> },
    Team: { title: "Admin Team", content: <TeamAD /> },
    Support: { title: "Support", content: <SupportAD /> },
  };

  const current = contentMap[activeMenu] || contentMap["Dashboard"];

  return (
    <div className="flex h-screen font-inter">
      <aside className="w-[70px] md:w-[250px] flex-shrink-0 bg-white p-2 md:p-4 border-r fixed h-full overflow-y-auto">
        <div className="flex items-center border-b mb-6 pb-4 px-2 md:px-4">
          <img src={Aster} alt="Logo" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
          <h1 className="hidden md:block text-lg font-bold text-pry">Aster<span className="text-blue">Cart</span></h1>
        </div>
        <nav>
          <h2 className="text-xs font-medium mb-4 hidden md:block text-gray-500">Main Menu</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => handleMenuClick(item.label)}
                  className={`flex items-center w-full px-2 py-2 md:px-4 rounded hover:bg-fade transition-all ${activeMenu === item.label ? "bg-fade text-black" : "text-gray-500"}`}
                >
                  <img src={activeMenu === item.label ? item.activeIcon : item.icon} alt={item.label} className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">{item.label.replace("Management", " Mgmt")}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="ml-[70px] md:ml-[250px] w-full h-full pb-4 overflow-y-auto">
        <AdminHeader title={current.title} />
        <div className="flex flex-col px-5 pt-4">
          {current.content}
        </div>
      </main>
    </div>
  );
};

export default AdminAD;
