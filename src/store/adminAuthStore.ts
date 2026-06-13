import { create } from "zustand";
import api from "../utils/api";
import { toast } from "react-toastify";

interface AdminUser {
  id: string;
  email: string;
  userType: string;
  role: "super_admin" | "finance" | "support" | "operations";
  name: string;
}

// Role permissions - mirrors server ROLE_PERMISSIONS
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  finance: ["payments", "payouts", "refunds", "reports"],
  operations: ["stores", "orders", "products", "analytics"],
  support: ["disputes", "customers", "orders_view"],
};

export const canAccess = (role: string | undefined, permission: string): boolean => {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(permission);
};

interface AdminAuthStore {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  admin: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post<{ token: string; user: AdminUser }>(
        "/auth/admin/login",
        { email: email.trim().toLowerCase(), password }
      );
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("token", data.token);
      set({ admin: data.user, loading: false });
      toast.success("Welcome back!");
      return true;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Login failed");
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    set({ admin: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem("adminToken");
    return Boolean(token);
  },
}));
