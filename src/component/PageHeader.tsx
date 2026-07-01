import React from "react";
import { down, outline } from "../assets/res";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuthStore } from "../store/authStore";
import { useNotification } from "../hooks/useNotification";

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { storeProfile } = useAuthStore();
  const {
    notifications,
    showNotificationModal,
    toggleNotificationModal,
    markAsRead,
    markAllAsRead,
    formatToTodayTime,
    unreadCount,
    allRead,
    requestNotificationPermission,
  } = useNotification();

  const [notifPermission, setNotifPermission] = React.useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? "granted" : "denied");
  };

  return (
    <div className="flex justify-between font-inter items-center py-2 w-full h-[50px] px-4 bg-white">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-lg">{title}</h1>
      </div>

      <div className="flex space-x-2 md:space-x-4 items-center">
        {/* Notification bell */}
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

        {/* Notification dropdown */}
        {showNotificationModal && (
          <div className="absolute top-12 right-20 z-50 font-inter bg-white shadow-lg rounded-lg p-4 w-[411px]">
            <div className="flex justify-between mb-5 items-center gap-2 w-full">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm leading-5 font-semibold my-auto">
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#9EA0AA]">
                      {allRead ? "Read" : "Unread"}
                    </p>
                    <img src={down} alt="dropdown icon" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    onClick={markAllAsRead}
                    className="text-right text-sm cursor-pointer"
                  >
                    Mark all as read
                  </p>
                  <img
                    onClick={markAllAsRead}
                    src={outline}
                    alt="mark all read"
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {notifPermission === "default" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-700 mb-2">
                  Turn on browser notifications so you're alerted the instant a rider arrives for pickup —
                  even if this tab isn't open.
                </p>
                <button
                  onClick={handleEnableNotifications}
                  className="text-xs bg-pry text-white rounded-lg px-3 py-1.5"
                >
                  Enable notifications
                </button>
              </div>
            )}

            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No notifications yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`border-b cursor-pointer pb-2 ${
                      notif.type === "pickup_otp"
                        ? "border-orange-200 bg-orange-50 rounded-lg px-2 -mx-2"
                        : "border-gray-300"
                    } ${notif.read ? "text-gray-400" : "text-black"}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex flex-row gap-3">
                      <div className="flex flex-col gap-1 mx-2">
                        {notif.type === "pickup_otp" && (
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                            🛵 Rider at pickup
                          </span>
                        )}
                        <span className="text-sm leading-5">{notif.message}</span>
                        {!notif.read && (
                          <button className="text-xs text-left rounded-lg text-white bg-pry px-2 py-1 w-fit">
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
            )}

            <button
              onClick={toggleNotificationModal}
              className="text-xs mt-3 text-red-500"
            >
              Close
            </button>
          </div>
        )}

        {/* Store profile */}
        <div className="flex items-center font-inter px-2 md:px-3">
          <div className="p-1 rounded-full">
            {storeProfile?.picture ? (
              <img
                src={storeProfile.picture}
                alt="Store"
                className="w-6 h-6 md:w-6 md:h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-pry flex items-center justify-center text-white text-xs font-bold">
                {(storeProfile?.name || "S").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="px-1 md:px-2 text-[#434343] text-sm leading-5 py-1">
            <p className="font-semibold">{storeProfile?.name || "Store"}</p>
            <p className="text-xs text-gray-600">{storeProfile?.email || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
