import React, { useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { useAdminAuthStore } from "../store/adminAuthStore";

const SettingsAD: React.FC = () => {
  const admin = useAdminAuthStore((s) => s.admin);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Platform settings (read-only for now — editable in future)
  const platformSettings = [
    { label: "Platform commission", value: "10%", desc: "Percentage taken from each order" },
    { label: "Store payout", value: "90%", desc: "Percentage paid to store after order" },
    { label: "Service fee", value: "5%", desc: "Fee charged to customer at checkout" },
    { label: "Delivery fee", value: "₦800 flat", desc: "Standard delivery charge per order" },
  ];

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields."); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match."); return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setSaving(true);
    try {
      await api.put("/auth/admin/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-inter space-y-6">

      {/* Admin profile */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-4">Admin profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pry flex items-center justify-center text-white text-2xl font-bold">
            {(admin?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-base">{admin?.email?.split("@")[0] || "Admin"}</p>
            <p className="text-sm text-gray-500">{admin?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Super Administrator</p>
          </div>
        </div>
      </div>

      {/* Platform settings */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-1">Platform settings</h2>
        <p className="text-sm text-gray-400 mb-4">Current fee structure. To change these, update the values in the server configuration.</p>
        <div className="grid grid-cols-2 gap-4">
          {platformSettings.map((s, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">{s.desc}</p>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-base font-bold text-pry">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-4">Change admin password</h2>
        <div className="space-y-3 max-w-md">
          {[
            { label: "Current password", value: currentPassword, set: setCurrentPassword },
            { label: "New password", value: newPassword, set: setNewPassword },
            { label: "Confirm new password", value: confirmPassword, set: setConfirmPassword },
          ].map((f, i) => (
            <div key={i}>
              <label className="text-xs text-gray-500 font-medium mb-1 block">{f.label}</label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
              />
            </div>
          ))}
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="mt-2 bg-pry text-white rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Change password"}
          </button>
        </div>
      </div>

      {/* System info */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-4">System information</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>Platform</span><span className="font-medium">Astercart Marketplace</span></div>
          <div className="flex justify-between"><span>Payment provider</span><span className="font-medium">Flutterwave</span></div>
          <div className="flex justify-between"><span>Database</span><span className="font-medium">MongoDB Atlas</span></div>
          <div className="flex justify-between"><span>Server</span><span className="font-medium">Render (Node.js)</span></div>
          <div className="flex justify-between"><span>Currency</span><span className="font-medium">NGN (₦)</span></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAD;
