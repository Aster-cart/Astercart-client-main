import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { useAdminAuthStore } from "../store/adminAuthStore";

interface FeeConfig {
  platformCommission: number;
  storePayout: number;
  serviceFee: number;
  deliveryFee: number; // flat fallback ONLY — used when a store/customer hasn't captured location yet
  deliveryBaseFare: number;
  deliveryRatePerKm: number;
  deliveryFeeMinimum: number;
  deliveryFeeMaximum: number;
  deliveryCommissionRate: number; // Astercart's cut of the delivery fee — the "Uber model" cut
}

const SettingsAD: React.FC = () => {
  const admin = useAdminAuthStore((s) => s.admin);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [feeConfig, setFeeConfig] = useState<FeeConfig>({
    platformCommission: 10,
    storePayout: 90,
    serviceFee: 5,
    deliveryFee: 800,
    deliveryBaseFare: 500,
    deliveryRatePerKm: 100,
    deliveryFeeMinimum: 300,
    deliveryFeeMaximum: 5000,
    deliveryCommissionRate: 10,
  });
  const [loadingFees, setLoadingFees] = useState(true);
  const [savingFees, setSavingFees] = useState(false);

  // Load the REAL, currently-active rates from the server on mount —
  // previously this screen always showed hardcoded 10/90/5/800 regardless
  // of what (if anything) had actually been saved before, which meant the
  // admin had no way to even see what rate was really in effect.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<FeeConfig>("/admin/platform-config");
        setFeeConfig(data);
      } catch {
        // Fall back to the visible defaults if the endpoint isn't reachable
      } finally {
        setLoadingFees(false);
      }
    })();
  }, []);

  const handleFeeChange = (key: keyof FeeConfig, value: string) => {
    const num = parseFloat(value) || 0;
    setFeeConfig((prev) => {
      const updated = { ...prev, [key]: num };
      // Keep storePayout in sync with platformCommission
      if (key === "platformCommission") {
        updated.storePayout = Math.max(0, 100 - num);
      }
      if (key === "storePayout") {
        updated.platformCommission = Math.max(0, 100 - num);
      }
      return updated;
    });
  };

  const handleSaveFees = async () => {
    if (feeConfig.platformCommission + feeConfig.storePayout > 100) {
      toast.error("Platform commission + store payout cannot exceed 100%");
      return;
    }
    setSavingFees(true);
    try {
      const { data } = await api.put("/admin/platform-config", feeConfig);
      toast.success(data?.message || "Platform fee structure updated.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save fee config.");
    } finally {
      setSavingFees(false);
    }
  };

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

      {/* Platform fee configuration — editable */}
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-lg font-semibold mb-1">Platform fee structure</h2>
        <p className="text-sm text-gray-400 mb-4">
          These are the live default rates currently in effect for every new order. You can
          set a different rate for a specific store from Store Management — that override
          always takes priority over these defaults for that store.
        </p>
        {loadingFees ? (
          <p className="text-sm text-gray-400">Loading current rates…</p>
        ) : (
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          {[
            { key: "platformCommission" as keyof FeeConfig, label: "Platform commission (%)", suffix: "%" },
            { key: "storePayout" as keyof FeeConfig, label: "Store payout (%)", suffix: "%" },
            { key: "serviceFee" as keyof FeeConfig, label: "Service fee (%)", suffix: "%" },
            { key: "deliveryFee" as keyof FeeConfig, label: "Delivery fee fallback (₦)", suffix: "₦" },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs text-gray-500 font-medium mb-1 block">{field.label}</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={feeConfig[field.key]}
                  onChange={(e) => handleFeeChange(field.key, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  min={0}
                  max={field.suffix === "%" ? 100 : 99999}
                />
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-200">
                  {field.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Distance-based delivery pricing — the Uber/Bolt model. Astercart
            doesn't own delivery vehicles; riders are independent, and this
            fee IS their fare. The "fallback" field above only applies when
            a store or customer hasn't captured their location yet. */}
        {!loadingFees && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold mb-1">Distance-based delivery pricing</h3>
          <p className="text-xs text-gray-400 mb-4">
            Calculated automatically from real distance between store and customer — like an
            Uber/Bolt fare. Astercart takes a cut of this fee (below); the rest goes to the
            rider. Rates below are a starting point modeled on current Lagos market pricing —
            expect to revise these once you have real rider cost data.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {[
              { key: "deliveryBaseFare" as keyof FeeConfig, label: "Base fare (₦)", suffix: "₦" },
              { key: "deliveryRatePerKm" as keyof FeeConfig, label: "Rate per km (₦)", suffix: "₦" },
              { key: "deliveryFeeMinimum" as keyof FeeConfig, label: "Minimum fee (₦)", suffix: "₦" },
              { key: "deliveryFeeMaximum" as keyof FeeConfig, label: "Maximum fee (₦)", suffix: "₦" },
              { key: "deliveryCommissionRate" as keyof FeeConfig, label: "Astercart's cut of delivery fee (%)", suffix: "%" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 font-medium mb-1 block">{field.label}</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={feeConfig[field.key]}
                    onChange={(e) => handleFeeChange(field.key, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                    min={0}
                    max={field.suffix === "%" ? 100 : 99999}
                  />
                  <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-200">
                    {field.suffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        <button
          onClick={handleSaveFees}
          disabled={savingFees}
          className="mt-4 bg-pry text-white rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-60"
        >
          {savingFees ? "Saving…" : "Save fee structure"}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Note: Changes apply to new orders. Existing orders are not affected.
        </p>
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
          {[
            ["Platform", "Astercart Marketplace"],
            ["Payment provider", "Flutterwave"],
            ["Database", "MongoDB Atlas"],
            ["Server", "Render (Node.js)"],
            ["Currency", "NGN (₦)"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span>{k}</span><span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsAD;
