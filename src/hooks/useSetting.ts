import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useToggle } from "../hooks/useToggle";
import {
  BusinessFormProps,
  NotificationPreferences,
} from "../types/setting.types";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export const useSetting = () => {
  const navigate = useNavigate();
  const { storeProfile, updateStoreData, checkAuth } = useAuthStore();

  // Step management
  const [activeStep, setActiveStep] = useState<
    "business" | "notification" | "roles"
  >("business");
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  // Form state
  const initialState: BusinessFormProps = {
    businessName: storeProfile?.name || "",
    emailAddress: storeProfile?.email || "",
    phoneNumber: storeProfile?.phoneNumber || "",
    businessAddress: storeProfile?.storeDetails?.address || "",
    supportingEmail: storeProfile?.supportingEmail || "",
    supportingPhone: storeProfile?.supportingPhone || "",
    state: storeProfile?.storeDetails?.state || "",
    lga: storeProfile?.storeDetails?.lga || "",
    profilePhoto: storeProfile?.picture || "https://via.placeholder.com/150",
  description: (storeProfile?.storeDetails as any)?.description || "", 
  };

  const [formData, setFormData] = useState<BusinessFormProps>(initialState);
  const [isEditable, setIsEditable] = useState(false);

  // Password state
  const [passwordError, setPasswordError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notificationOptions: Record<keyof NotificationPreferences, { label: string; description: string }> = {
    newOrder: {
      label: "New Order",
      description: "Get notified when a new order is placed.",
    },
    orderUpdates: {
      label: "Order Updates",
      description: "Receive updates about changes to existing orders.",
    },
    paymentReceived: {
      label: "Payment Received",
      description: "Be alerted when a payment is successfully processed.",
    },
    lowStock: {
      label: "Low Stock",
      description: "Get notified when stock levels are running low.",
    },
    outOfStock: {
      label: "Out of Stock",
      description: "Know when a product is completely out of stock.",
    },
    promotions: {
      label: "Promotions",
      description: "Stay updated on new promotional campaigns and deals.",
    },
    systemAlerts: {
      label: "System Alerts",
      description: "Receive critical alerts about system changes or issues.",
    },
  };

  // Notification settings
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    newOrder: storeProfile?.notificationPreferences?.newOrder ?? true,
    orderUpdates: storeProfile?.notificationPreferences?.orderUpdates ?? true,
    paymentReceived: storeProfile?.notificationPreferences?.paymentReceived ?? true,
    lowStock: storeProfile?.notificationPreferences?.lowStock ?? true,
    outOfStock: storeProfile?.notificationPreferences?.outOfStock ?? true,
    promotions: storeProfile?.notificationPreferences?.promotions ?? true,
    systemAlerts: storeProfile?.notificationPreferences?.systemAlerts ?? true,
  });
  const [areAllNotificationsEnabled, setAreAllNotificationsEnabled] = useState(
    Object.values(notificationPreferences).every((value) => value)
  );
  const [notificationIsModified, setNotificationIsModified] = useState(false);
  const [isTransactionEmailChecked, setIsTransactionEmailChecked] =
    useState(false);
  const [isCustomerReceiptChecked, setIsCustomerReceiptChecked] =
    useState(false);
  const [isCashierNotificationChecked, setIsCashierNotificationChecked] =
    useState(false);

  // Toggle states
  const { values, toggleValue } = useToggle({
    newPasswordVisible: false,
    confirmPasswordVisible: false,
    passwordVisible: false,
    isNotificationsEnabled: false,
    editPassword: false,
  });

  useEffect(() => {
    setIsModified(JSON.stringify(formData) !== JSON.stringify(initialState));
  }, [formData]);


  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
};


  const handleImageUpload = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "projectImg");
    data.append("cloud_name", "dfdjpafgs");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dfdjpafgs/image/upload",
        {
          method: "POST",
          body: data,
        }
      );
      const res = await response.json();
      return res.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        setFormData((prev) => {
          const updatedData = { ...prev, profilePhoto: imageUrl };
          updateStoreData(updatedData);
          return updatedData;
        });
      }
    } finally {
      setImageLoading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSave = async () => {
    if (!isModified) return;
    setLoading(true);
    await updateStoreData(formData);
    setLoading(false);
    setIsEditable(false);
    setIsModified(false);
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      await api.put("/store/change-password", { oldPassword, newPassword });
      localStorage.removeItem("token");
      sessionStorage.clear();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const toggleAllNotifications = () => {
    const newState = !areAllNotificationsEnabled;
    setAreAllNotificationsEnabled(newState);
    const updatedPreferences = Object.keys(notificationPreferences).reduce(
      (acc, key) => {
        acc[key as keyof typeof notificationPreferences] = newState;
        return acc;
      },
      {} as typeof notificationPreferences
    );
    console.log(updatedPreferences);
    setNotificationIsModified(true);
    setNotificationPreferences(updatedPreferences);
  };
  
  const handleCheckboxChange = (key: keyof NotificationPreferences) => {
    setNotificationPreferences((prev) => {
      const updatedPreferences = { ...prev, [key]: !prev[key] };
      setNotificationIsModified(true);
      return updatedPreferences;
    });
  };

  const updateNotifications = async () => {
    setLoading(true);
    try {
      await api.put("/store/update-notifications", {
        notificationPreferences,
      });
      setNotificationIsModified(false);
      checkAuth();
    } catch {
      setNotificationError("Failed to update preferences.");
    } finally {

      setLoading(false);
    }
  };

  return {
    fileInputRef,
    handlePhotoUpload,
    triggerFileInput,
    handleChange,
    formData,
    setFormData,
    isEditable,
    handleSave,
    handleEdit: () => setIsEditable(!isEditable),
    handleStepChange: setActiveStep,
    passwordError,
    isTransactionEmailChecked,
    toggleTransactionEmail: () => setIsTransactionEmailChecked((prev) => !prev),
    isCustomerReceiptChecked,
    toggleCustomerReceipt: () => setIsCustomerReceiptChecked((prev) => !prev),
    isCashierNotificationChecked,
    toggleCashierNotification: () =>
      setIsCashierNotificationChecked((prev) => !prev),
    activeStep,
    newPasswordVisible: values.newPasswordVisible,
    toggleNewPasswordVisibility: () => toggleValue("newPasswordVisible"),
    confirmPasswordVisible: values.confirmPasswordVisible,
    toggleConfirmPasswordVisible: () => toggleValue("confirmPasswordVisible"),
    passwordVisible: values.passwordVisible,
    togglePasswordVisibility: () => toggleValue("passwordVisible"),
    isNotificationsEnabled: values.isNotificationsEnabled,
    toggleNotifications: () => toggleValue("isNotificationsEnabled"),
    isModified,
    loading,
    imageLoading,
    updatePassword,
    updateNotifications,
    editPassword: values.editPassword,
    toggleEditPassword: () => toggleValue("editPassword"),
    notificationIsModified,
    toggleAllNotifications,
    areAllNotificationsEnabled,
    notificationPreferences,
    handleCheckboxChange,
    notificationOptions,
    notificationError
  };
};
