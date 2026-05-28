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
  asteraster,
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
      label: "Settings",
      icon: setting,
      activeIcon: set,
      path: "/settings",
    },
  ];

  return (
    <aside className="w-[70px] md:w-[250px] flex-shrink-0 bg-white p-2 md:p-4 border-r fixed h-full overflow-y-auto transition-all duration-300">
      <div className="flex items-center border-b mb-6 pb-4 px-2 md:px-4">
        <img src={Aster} alt="Cart" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
        <h1 className="hidden md:block text-lg font-bold text-pry">
        <img src={asteraster} alt="" />
        </h1>
      </div>
      <nav>
        <h2 className="text-xs font-medium mb-4 hidden md:block text-gray-500">
          Main Menu
        </h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => {
                  setActiveMenu(item.label);
                  navigate(item.path);
                }}
                className={`flex items-center w-full px-2 py-2 md:px-4 rounded hover:bg-fade transition-all ${
                  activeMenu === item.label
                    ? "bg-fade text-black"
                    : "text-gray-500"
                }`}
              >
                <img
                  src={activeMenu === item.label ? item.activeIcon : item.icon}
                  alt={`${item.label} icon`}
                  className="w-4 h-4 mr-2"
                />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className={`flex items-center w-full px-2 py-2 md:px-4 rounded hover:bg-fade transition-all text-gray-500`}
            >
              <img src={logout} alt={`Logout icon`} className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
