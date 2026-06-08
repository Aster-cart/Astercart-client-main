import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";
import { useAuthStore } from "../store/authStore";
import PageHeader from "../component/PageHeader";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("");
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    // Fetch profile in background — don't block render
    checkAuth().catch(() => {});

    const map: Record<string, string> = {
      "/": "Dashboard",
      "/orders": "Orders",
      "/inventory": "Inventory",
      "/settings": "Settings",
    };
    setActiveMenu(map[location.pathname] || "Dashboard");
  }, [location.pathname, navigate, checkAuth]);

  return (
    <div className="flex h-screen overflow-hidden font-inter">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="ml-[70px] md:ml-[250px] w-full h-full bg-gray-100 overflow-y-auto transition-all">
        <PageHeader title={activeMenu} />
        {/* Render outlet immediately — no longer blocked by storeProfile */}
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
