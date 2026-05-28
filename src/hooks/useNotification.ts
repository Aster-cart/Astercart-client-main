import { useState } from "react";

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
}

export const useNotification = () => {
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

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Check if all notifications are read
  const allRead = notifications.every((notif) => notif.read);

  return {
    notifications,
    showNotificationModal,
    toggleNotificationModal,
    markAsRead,
    markAllAsRead,
    formatToTodayTime,
    unreadCount,
    allRead,
  };
};
