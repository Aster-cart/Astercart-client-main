import React from "react";
import { useNavigate } from "react-router-dom";
import { down } from "../assets/res";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuthStore } from "../store/authStore";
import { useNotification } from "../hooks/useNotification";

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
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
    <div className="flex justify-between font-inter items-center py-2 w-full h-[56px] px-4 md:px-6 bg-white border-b border-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-xl font-space font-bold text-ink">{title}</h1>
      </div>

      <div className="flex space-x-2 md:space-x-4 items-center">
        {/* Notification bell */}
        <button
          onClick={toggleNotificationModal}
          className="relative bg-pry rounded-full p-1.5 md:p-2 hover:bg-orange-600 transition-colors"
        >
          <IoNotificationsOutline className="text-lg md:text-xl text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {showNotificationModal && (
          <div className="absolute top-14 right-4 z-50 font-inter bg-white shadow-xl rounded-xl p-4 w-[411px] border border-border">
            <div className="flex justify-between mb-4 items-center w-full">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-space font-bold text-ink">
                  Notifications
                </h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted">
                    {allRead ? "Read" : "Unread"}
                  </p>
                  <img src={down} alt="dropdown icon" />
                </div>
              </div>
              <button
                onClick={markAllAsRead}
                className="text-xs text-pry font-medium hover:underline"
              >
                Mark all as read
              </button>
            </div>

            {notifPermission === "default" && (
              <div className="bg-pry-light border border-pry-mid rounded-lg p-3 mb-3">
                <p className="text-xs text-body mb-2">
                  Turn on browser notifications so you're alerted the instant a rider arrives for pickup —
                  even if this tab isn't open.
                </p>
                <button
                  onClick={handleEnableNotifications}
                  className="text-xs bg-pry text-white rounded-lg px-3 py-1.5 hover:bg-orange-600 transition-colors"
                >
                  Enable notifications
                </button>
              </div>
            )}

            {notifications.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No notifications yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`cursor-pointer pb-2 ${
                      notif.type === "pickup_otp"
                        ? "bg-pry-light rounded-lg px-3 -mx-2"
                        : "border-b border-border"
                    } ${notif.read ? "opacity-60" : ""}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex flex-col gap-1 py-1">
                      {notif.type === "pickup_otp" && (
                        <span className="text-[10px] font-bold text-pry uppercase tracking-wide">
                          Rider at pickup
                        </span>
                      )}
                      <span className="text-sm leading-5 text-body">{notif.message}</span>
                      {!notif.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); navigate("/orders"); }}
                          className="text-xs rounded-lg text-white bg-pry hover:bg-orange-600 transition-colors px-2 py-1 w-fit"
                        >
                          View
                        </button>
                      )}
                      <span className="text-xs text-muted">
                        {formatToTodayTime(notif.timestamp)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={toggleNotificationModal}
              className="text-xs mt-3 text-pry font-medium hover:underline"
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
          <div className="px-1 md:px-2 text-body text-sm leading-5 py-1">
            <p className="font-semibold">{storeProfile?.name || "Store"}</p>
            <p className="text-xs text-muted">{storeProfile?.email || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
