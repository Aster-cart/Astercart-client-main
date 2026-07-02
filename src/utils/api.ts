import axios from "axios";
import { api_url} from "./const";

const api = axios.create({
  baseURL: api_url,
    headers: { "Content-Type": "application/json" },
});

// Interceptor to add Bearer token to requests
api.interceptors.request.use((config) => {
  

  // ── Why this changed ──────────────────────────────────────────────────
  // Previously this guessed "is this an admin request?" by checking if
  // the API URL contained the word "admin" — but plenty of genuinely
  // admin-only endpoints don't have "admin" anywhere in their path at
  // all (e.g. /payment/all, /payouts/all are admin-protected on the
  // SERVER, but their URL gives no hint of that). Any such endpoint was
  // silently sent with the STORE token, and the server correctly
  // rejected it with "Admin access required" — not because of a real
  // permission problem, but because the wrong token was attached before
  // the request even left the browser.
  //
  // The robust fix: stop guessing from the URL at all. Instead, check
  // which dashboard is actually being used right now — if the browser
  // is currently on an /admin page AND an admin session exists, every
  // single request from this app instance uses the admin token, full
  // stop. A logged-in admin browsing the admin dashboard never
  // legitimately needs to act as a store. Only fall back to the store
  // token if there's genuinely no admin session active at all (i.e.
  // you're on the store dashboard instead).
  const onAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const adminToken = localStorage.getItem("adminToken");
  const storeToken = localStorage.getItem("token");

  const token = (onAdminPage && adminToken) ? adminToken : (storeToken || adminToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    (config.headers as any)["x-auth-token"] = token;
    (config.headers as any)["token"] = token;
  }
  return config;
});


export default api;
