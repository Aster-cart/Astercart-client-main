import { useNavigate } from "react-router-dom";
import {
  Aster,
  dashboard,
  inventory,
  logout,
  orders,
  setting,
  dash,
  ord,
  set,
  invent,
} from "../assets/res";

const Sidebar: React.FC<{
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}> = ({ activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  const menuItems = [
    {
      label: "Dashboard",
      icon: dashboard,
      activeIcon: dash,
      path: "/",
    },
    { label: "Orders", icon: orders, activeIcon: ord, path: "/orders" },
    {
      label: "Inventory",
      icon: inventory,
      activeIcon: invent,
      path: "/inventory",
    },
    {
      label: "Analytics",
      icon: setting,
      activeIcon: setting,
      path: "/analytics",
    },
    {
      label: "Earnings",
      icon: setting,
      activeIcon: setting,
      path: "/earnings",
    },
    {
      label: "Disputes",
      icon: setting,
      activeIcon: setting,
      path: "/disputes",
    },
    {
      label: "Support",
      icon: setting,
      activeIcon: setting,
      path: "/support",
    },
    {
      label: "Settings",
      icon: setting,
      activeIcon: set,
      path: "/settings",
    },
    {
      label: "Verification",
      icon: setting,
      activeIcon: set,
      path: "/verification",
    },
  ];

  return (
    <aside className="w-[70px] md:w-[250px] flex-shrink-0 bg-ink p-2 md:p-4 fixed h-full overflow-y-auto transition-all duration-300 z-20">
      <div className="flex items-center mb-8 pb-4 px-2 md:px-4 border-b border-white/10">
        <img src={Aster} alt="Cart" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
        <h1 className="hidden md:block text-lg font-bold text-white">
          Aster<span className="text-pry">Cart</span>
        </h1>
      </div>
      <nav>
        <h2 className="text-xs font-medium mb-4 hidden md:block text-white/40 uppercase tracking-wider">
          Main Menu
        </h2>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => {
                  setActiveMenu(item.label);
                  navigate(item.path);
                }}
                className={`flex items-center w-full px-2 py-2.5 md:px-4 rounded-lg transition-all ${
                  activeMenu === item.label
                    ? "bg-pry text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <img
                  src={activeMenu === item.label ? item.activeIcon : item.icon}
                  alt={`${item.label} icon`}
                  className="w-4 h-4 mr-2 brightness-0 invert opacity-60"
                  style={activeMenu === item.label ? { filter: 'brightness(0) invert(1)', opacity: 1 } : {}}
                />
                <span className="hidden md:inline text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
          <li className="pt-2 mt-2 border-t border-white/10">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="flex items-center w-full px-2 py-2.5 md:px-4 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-all"
            >
              <img src={logout} alt="Logout icon" className="w-4 h-4 mr-2 brightness-0 invert opacity-40" />
              <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
