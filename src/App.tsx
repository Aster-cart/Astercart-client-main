import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import SignUp from "./pages/SignUp";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AuthLayout from "./layout/AuthLayout";
import DashboardLayout from "./layout/DashboardLayout";
import Error404 from "./pages/Error404";
import Order from "./pages/Order";
import Inventory from "./pages/Inventory";
import Setting from "./pages/Setting";
import Earnings from "./pages/Earnings";
import Analytics from "./pages/Analytics";
import LoginAD from "./admin/LoginAD";
import SignupAD from "./admin/SignupAD";
import ForgotPasswordAD from "./admin/ForgotPasswordAD";
import AdminAD from "./admin/AdminAD";
import { useAdminAuthStore } from "./store/adminAuthStore";

// Protects admin routes — redirects to admin login if no admin token
function AdminGuard({ children }: { children: React.ReactNode }) {
  const ok = useAdminAuthStore((s) => s.checkAuth());
  if (!ok) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

// Protects store dashboard routes — redirects to login if no store token
function StoreGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Store auth — no guard, just layout wrapper */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Route>

        {/* Store dashboard — protected by StoreGuard */}
        <Route
          element={
            <StoreGuard>
              <DashboardLayout />
            </StoreGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Order />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Setting />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Platform admin auth */}
        <Route path="/admin/login" element={<LoginAD />} />
        <Route path="/admin/signup" element={<SignupAD />} />
        <Route path="/admin/forgotpassword" element={<ForgotPasswordAD />} />

        {/* Platform admin dashboard — protected by AdminGuard */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminAD />
            </AdminGuard>
          }
        />

        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
