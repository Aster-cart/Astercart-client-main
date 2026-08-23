import axios from "axios";
import { api_url } from "./const";
import { Sentry } from "../lib/sentry";

const api = axios.create({
  baseURL: api_url,
  headers: { "Content-Type": "application/json" },
});

function getTokens() {
  const onAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const adminToken = localStorage.getItem("adminToken");
  const storeToken = localStorage.getItem("token");
  const token = (onAdminPage && adminToken) ? adminToken : (storeToken || adminToken);
  const refreshToken = onAdminPage
    ? localStorage.getItem("adminRefreshToken")
    : localStorage.getItem("refreshToken");
  return { token, refreshToken, onAdminPage };
}

function saveTokens(token: string, refreshToken: string, onAdminPage: boolean) {
  if (onAdminPage) {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminRefreshToken", refreshToken);
  } else {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("storeId");
  localStorage.removeItem("storeName");
}

const REFRESH_PATH = "/auth/refresh-token";
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const { refreshToken, onAdminPage } = getTokens();
      if (!refreshToken) return false;
      const res = await axios.post(`${api_url}${REFRESH_PATH}`, { refreshToken });
      const data = res.data as { token: string; refreshToken: string };
      if (data.token && data.refreshToken) {
        saveTokens(data.token, data.refreshToken, onAdminPage);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

// Request interceptor — add Bearer token
api.interceptors.request.use((config) => {
  const onAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const adminToken = localStorage.getItem("adminToken");
  const storeToken = localStorage.getItem("token");
  const token = (onAdminPage && adminToken) ? adminToken : (storeToken || adminToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    (config.headers as any)["x-auth-token"] = token;
    (config.headers as any)["token"] = token;
  }

  Sentry.addBreadcrumb({
    category: "network",
    message: `${config.method?.toUpperCase() ?? "GET"} ${config.url}`,
    level: "info",
    data: { method: config.method?.toUpperCase() ?? "GET", status: 0 },
  });

  return config;
});

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as { _retry?: boolean; url?: string; headers: Record<string, string> };
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== REFRESH_PATH
    ) {
      originalRequest._retry = true;
      const refreshed = await attemptRefresh();
      if (refreshed) {
        const { onAdminPage } = getTokens();
        const adminToken = localStorage.getItem("adminToken");
        const storeToken = localStorage.getItem("token");
        const newToken = onAdminPage ? adminToken : storeToken;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }
      clearAuth();
      window.location.href = window.location.pathname.startsWith("/admin") ? "/loginad" : "/login";
    }
    if (error.response) {
      Sentry.addBreadcrumb({
        category: "network",
        message: `${error.config?.method?.toUpperCase() ?? "GET"} ${error.config?.url}`,
        level: "error",
        data: { status: error.response.status },
      });

      if (error.response.status >= 500) {
        const safeMessage = "An unexpected error occurred. Please try again later.";
        if (typeof error.response.data === "object" && error.response.data !== null) {
          error.response.data.message = safeMessage;
        } else {
          error.response.data = { message: safeMessage };
        }
        error.message = safeMessage;
      }
    } else {
      const safeMessage = "Unable to connect to the server. Please check your connection and try again.";
      error.message = safeMessage;
      (error as any).response = {
        status: 0,
        data: { message: safeMessage },
      };
    }
    return Promise.reject(error);
  }
);

export default api;
