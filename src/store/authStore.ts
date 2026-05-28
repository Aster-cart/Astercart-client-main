import { create } from "zustand";
import axios from "axios";
import api from "../utils/api";
import { toast } from "react-toastify";
import { decodeJwt } from "../utils/jws";

/** ---------- Types you already use (adjust as needed) ---------- */
export interface StoreSummary {
  _id: string;
  username: string;
  profilePic: string;
  email: string;
  accountDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreProfile {
  storeDetails: {
    address: string;
    state: string;
    postalCode?: string;
    lga: string;
  };
  notificationPreferences: {
    newOrder: boolean;
    orderUpdates: boolean;
    paymentReceived: boolean;
    lowStock: boolean;
    outOfStock: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  };
  _id: string;
  name: string;
  email: string;
  userType: string;
  picture: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  resetToken: string | null;
  isOtpVerified: boolean;
  otpStep: string;
  otp: string;
  resetTokenExpiry: string | null;
  phoneNumber: string | null;
  supportingEmail: string | null;
  supportingPhone: string | null;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  storeDetails: {
    address: string;
    state: string;
    postalCode: string;
    lga: string;
  };
  userType?: "Store";
}

export interface AuthStore {
  storeSummary: StoreSummary | null;
  storeProfile: StoreProfile | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignUpData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateStoreData: (updatedData: Partial<StoreProfile>) => Promise<boolean>;
}

/** ---------- Small helper: decode JWT payload on the client ---------- */


/** ---------- Zustand store ---------- */
export const useAuthStore = create<AuthStore>((set) => ({
  storeSummary: null,
  storeProfile: null,
  loading: false,
  error: null,

  // -------- LOGIN (client-only robust) --------
login: async (email, password) => {
  set({ loading: true, error: null });

  if (!email || !password) {
    const msg = "Please enter both email and password";
    toast.error(msg);
    set({ error: msg, loading: false });
    return false;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    const msg = "Email format is invalid!";
    toast.error(msg);
    set({ error: msg, loading: false });
    return false;
  }

  if (password.length < 8) {
    const msg = "Password must be at least 8 characters long";
    toast.error(msg);
    set({ error: msg, loading: false });
    return false;
  }

  try {
    type LoginResponse = { token: string; user?: any; message?: string; };

    const { data } = await api.post<LoginResponse>("/auth/store/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    // Save token
    localStorage.setItem("token", data.token);

    // Decode token to get storeId + storeName
    const payload = decodeJwt<{ id?: string; storeName?: string }>(data.token) || {};
    const storeId = payload.id || "";
    const storeName = payload.storeName || "";

    if (storeId)  localStorage.setItem("storeId", storeId);
    if (storeName) localStorage.setItem("storeName", storeName);

    // Minimal profiles so UI can render immediately
    const minimalSummary: StoreSummary = {
      _id: storeId,
      username: storeName,
      email: email.trim().toLowerCase(),
      profilePic: "",
      accountDetails: { accountName: "", accountNumber: "", bankName: "" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const minimalProfile: StoreProfile = {
      _id: storeId,
      name: storeName,
      email: email.trim().toLowerCase(),
      userType: "Store",
      picture: null,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notificationPreferences: {
        newOrder: true,
        orderUpdates: true,
        paymentReceived: true,
        lowStock: true,
        outOfStock: true,
        promotions: true,
        systemAlerts: true,
      },
      storeDetails: { address: "", state: "", lga: "", postalCode: "" },
      __v: 0,
      resetToken: null,
      isOtpVerified: false,
      otpStep: "",
      otp: "",
      resetTokenExpiry: null,
      phoneNumber: null,
      supportingEmail: null,
      supportingPhone: null,
    };

    set({
      storeSummary: (data.user as StoreSummary) ?? minimalSummary,
      storeProfile: (data.user as StoreProfile) ?? minimalProfile,
      loading: false,
    });

    toast.success("Login successful!");
    return true;
  } catch (error: any) {
    console.error("Login error:", error);
    let msg = "An unexpected error occurred.";
    if (axios.isAxiosError(error)) {
      if (error.response?.data && typeof error.response.data === "object") {
        msg = (error.response.data as any).message || (error.response.data as any).error || msg;
      } else if (error.message) {
        msg = error.message;
      }
    }
    toast.error(msg);
    set({ loading: false, error: msg });
    return false;
  }
},

  
  signup: async (userData) => {
    set({ loading: true, error: null });

    const { name, email, password, storeDetails } = userData;
    const { address, state, postalCode, lga } = storeDetails;

    if (!name || !email || !password || !address || !state || !postalCode || !lga) {
      const msg = "Please fill in all fields!";
      toast.error(msg);
      set({ error: msg, loading: false });
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      const msg = "Email format is invalid!";
      toast.error(msg);
      set({ error: msg, loading: false });
      return false;
    }

    if (password.length < 8) {
      const msg = "Password must be at least 8 characters long";
      toast.error(msg);
      set({ error: msg, loading: false });
      return false;
    }

    try {
      await api.post(`/auth/signup/store`, {
        ...userData,
        email: userData.email.trim().toLowerCase(),
        userType: "Store",
      });

      set({ loading: false });
      toast.success("Signup successful!");
      return true;
    } catch (error: any) {
      const msg =
        axios.isAxiosError(error)
          ? (error.response?.data as any)?.message || "Signup error"
          : "Signup error";
      set({ error: msg, loading: false });
      return false;
    }
  },

  // -------- LOGOUT --------
  logout: () => {
    localStorage.removeItem("token");
    set({ storeSummary: null, storeProfile: null, error: null });
  },

  // -------- CHECK AUTH (best-effort; don't block UI) --------
  checkAuth: async () => {
    try {
      // If your working endpoint is different, adjust this path.
      const { data } = await api.get(`/store/store-details`);
      // Expecting { storeProfile: ... }
      if (data?.storeProfile) {
        set({ storeProfile: data.storeProfile });
      }
    } catch (error: any) {
      // Do NOT break the app—token might be valid but server route is strict.
      console.warn(
        "checkAuth failed:",
        axios.isAxiosError(error) ? error.response?.status : "",
        axios.isAxiosError(error) ? error.response?.data : error
      );
    }
  },

  // -------- UPDATE STORE DATA --------
  updateStoreData: async (updatedData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/store/update-profile`, updatedData);
      set((state) => ({
        storeProfile: { ...(state.storeProfile as any), ...(data.store || {}) },
        loading: false,
      }));
      toast.success("Store details updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Update error:", error);
      set({ loading: false });
      toast.error(
        axios.isAxiosError(error)
          ? (error.response?.data as any)?.message || "Failed to update store data"
          : "Failed to update store data"
      );
      return false;
    }
  },
}));
