import axios from "axios";
import { api_url} from "./const";

const api = axios.create({
  baseURL: api_url,
    headers: { "Content-Type": "application/json" },
});

// Interceptor to add Bearer token to requests
api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAdminRoute =
    url.includes("/admin") ||
    url.includes("/dashboard") ||
    url.includes("/adminOrder") ||
    url.includes("/adminCustomer") ||
    url.includes("/adminstore");
  const token =
    (isAdminRoute && localStorage.getItem("adminToken")) ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    (config.headers as any)["x-auth-token"] = token;
    (config.headers as any)["token"] = token;
  }
  return config;
});


export default api;