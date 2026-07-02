import React, { useState } from "react";
import {
  Aster,
  dashboard,
  inventory,
  logout,
  orders,
  setting,
  dash,
  log,
  ord,
  set,
  invent,
  calender,
  map,
  down,
  outline,
} from "../assets/res";
import { IoNotificationsOutline } from "react-icons/io5";
import Inventory from "./Inventory";
import Dashboard from "./Dashboard";
import Order from "./Order";
import Setting from "./Setting";
import Verification from "./Verification";

interface Notification {
  id: number;
  message: string;
  read: boolean;
}

interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
}

const PageHeader: React.FC<{ title: string }> = ({ title }) => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
 

  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Order received: User ordered Air Force One",
      read: false,
      timestamp: "2024-11-16 14:35",
    },
    {
      id: 2,
      message: "Your subscription expires soon.",
      read: false,
      timestamp: "2024-11-15 10:12",
    },
    {
      id: 3,
      message: "System maintenance scheduled for tonight.",
      read: false,
      timestamp: "2024-11-14 08:45",
    },
  ]);

  const [showNotificationModal, setShowNotificationModal] =
    useState<boolean>(false);

  // Toggle modal visibility
  const toggleNotificationModal = () => {
    setShowNotificationModal(!showNotificationModal);
  };

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => ({ ...notif, read: true }))
    );
  };

  const formatToTodayTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "pm" : "am";
    return `Today at ${hours}:${minutes} ${ampm}`;
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Check if all notifications are read
  const allRead = notifications.every((notif) => notif.read);

  return (
    <div className="flex justify-between font-inter items-center py-2 w-full h-[50px] px-4 bg-white">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-lg">{title}</h1>
        <span className="flex items-center text-sm px-3 md:px-4 py-1 md:py-2 rounded-3xl bg-[#FFF6F0] text-[#7B7B7B]">
          <img className="pr-2" src={calender} alt="" />
          {formattedDate}
        </span>
      </div>
      <div className="flex space-x-2 md:space-x-4">

        <button
          onClick={toggleNotificationModal}
          className="relative bg-pry rounded-full p-1 md:p-2"
        >
          <IoNotificationsOutline className="text-lg md:text-xl text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-1 left-4 bg-[#FFEBB2] text-pry text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotificationModal && (
          <div className="absolute top-12 right-20 z-50 font-inter bg-white shadow-lg rounded-lg p-4 w-[411px]">
            <div className="flex justify-between mb-5 items-center gap-2 w-full">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm leading-5 font-semibold my-auto">
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className=" text-sm text-[#9EA0AA]">
                      {allRead ? "Read" : "Unread"}
                    </p>
                    <img src={down} alt="Unread icon" className="" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    onClick={markAllAsRead}
                    className="text-right text-sm cursor-pointer"
                  >
                    Mark all as read
                  </p>
                  <img onClick={markAllAsRead} src={outline} alt="Mark as read icon" className="" />
                </div>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`border-b border-gray-300 cursor-pointer ${
                    notif.read ? "text-gray-400" : "text-black"
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex flex-row gap-3 px-0">
                    <div className="flex mx-5 flex-col">
                      <div className="flex flex-col gap-3">
                        <span className="text-sm leading-5">
                          {notif.message.split(":")[0]}
                        </span>
                        {notif.message.includes(":") &&
                          notif.message.split(":")[1] && (
                            <span className="text-sm leading-5">
                              {notif.message.split(":")[1]}
                            </span>
                          )}
                      </div>
                      {!notif.read && (
                        <button className="text-xs text-left rounded-lg mb-2 text-white bg-pry mt-1 px-2 py-1 w-fit">
                          View
                        </button>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatToTodayTime(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={toggleNotificationModal}
              className="text-xs mt-2 text-red-500"
            >
              Close
            </button>
          </div>
        )}

        <div className="flex items-center  font-inter border border-gray-300 rounded-3xl bg-[#F9FAFB] px-2 md:px-3">
          <div className="bg-fade p-1 rounded-full">
            <img src={map} alt="Map Icon" className="w-4 md:w-5 h-4 md:h-5" />
          </div>
          <div className="px-1 md:px-2 bg-[#F9FAFB] text-[#434343] text-sm leading-5 py-1 focus:outline-none">
            <p className=" p-2 rounded">
              Shoprite Ikeja
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");

  // Listen for navigation events from child components — this works
  // even when prop drilling fails, since it uses the browser's own
  // event system instead of React's prop chain
  React.useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab) setActiveMenu(tab);
    };
    window.addEventListener("astercart:navigate", handler);
    return () => window.removeEventListener("astercart:navigate", handler);
  }, []);
  const menuItems = [
    { label: "Dashboard", icon: dashboard, activeIcon: dash },
    { label: "Orders", icon: orders, activeIcon: ord },
    { label: "Inventory", icon: inventory, activeIcon: invent },
    { label: "Verification", icon: setting, activeIcon: set },
    { label: "Settings", icon: setting, activeIcon: set },
    { label: "Logout", icon: logout, activeIcon: log },
  ];

  const renderMainContent = () => {
    // Handle the image click to activate the input field

    switch (activeMenu) {
      case "Dashboard":
        return (
          <>
            <PageHeader title="Dashboard" />
            <div className="flex flex-col h-[calc(100vh-50px)] bg-[#F9FAFB]">
              <Dashboard />
            </div>
          </>
        );
      case "Orders":
        return (
          <>
            <PageHeader title="Orders" />
            <div className="flex flex-col h-[calc(100vh-50px)] bg-[#F9FAFB]">
              <Order />
            </div>
          </>
        );
      case "Inventory":
        return (
          <>
            <PageHeader title="Inventory" />
            <div className="flex flex-col h-[calc(100vh-50px)] bg-[#F9FAFB]">
              <Inventory onNavigate={setActiveMenu} />
            </div>
          </>
        );

      case "Verification":
        return (
          <>
            <PageHeader title="Store Verification" />
            <div className="flex flex-col h-[calc(100vh-50px)] bg-[#F9FAFB] overflow-y-auto">
              <Verification />
            </div>
          </>
        );
      case "Settings":
        return (
          <>
            <PageHeader title="Settings" />
            <div className="flex flex-col h-[calc(100vh-50px)] bg-[#F9FAFB]">
              <Setting />
            </div></>
        );
      case "Logout":
        return (
          <>
            <PageHeader title="Logout" />
            <div className="p-4">You have been logged out.</div>
          </>
        );
      default:
        return <div className="p-4">Select a menu item.</div>;
    }
  };

  return (
    <div className="flex h-screen  font-inter">
      {/* Sidebar */}
      <aside className="w-[70px] md:w-[250px] flex-shrink-0 bg-white p-2 md:p-4 border-r fixed h-full overflow-y-auto transition-all duration-300">
        {/* Header */}
        <div className="flex items-center border-b mb-6 pb-4 px-2 md:px-4">
          <img src={Aster} alt="Cart" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
          <h1 className="hidden md:block text-lg font-bold text-pry">
            Aster<span className="text-blue">Cart</span>
          </h1>
        </div>
        {/* Main Menu */}
        <nav>
          <h2 className="text-xs font-medium mb-4 hidden md:block text-gray-500">
            Main Menu
          </h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => setActiveMenu(item.label)}
                  className={`flex items-center w-full px-2 py-2 md:px-4 rounded hover:bg-fade transition-all ${
                    activeMenu === item.label
                      ? "bg-fade text-black"
                      : "text-gray-500"
                  }`}
                >
                  <img
                    src={
                      activeMenu === item.label ? item.activeIcon : item.icon
                    }
                    alt={`${item.label} icon`}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[70px] md:ml-[250px] w-full h-full bg-gray-100 overflow-y-auto transition-all">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Admin;
