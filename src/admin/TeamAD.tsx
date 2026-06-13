import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { useAdminAuthStore, canAccess } from "../store/adminAuthStore";

interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  adminRole: string;
  adminStatus: string;
  createdAt: string;
}

const ROLE_INFO = {
  super_admin: {
    label: "Super Admin",
    color: "bg-purple-100 text-purple-700",
    access: "Full access to everything",
  },
  finance: {
    label: "Finance Admin",
    color: "bg-blue-100 text-blue-700",
    access: "Payments, payouts, refunds, financial reports",
  },
  operations: {
    label: "Operations Admin",
    color: "bg-green-100 text-green-700",
    access: "Stores, orders, products, analytics",
  },
  support: {
    label: "Support Admin",
    color: "bg-yellow-100 text-yellow-700",
    access: "Disputes, customer management, order status",
  },
};

const TeamAD: React.FC = () => {
  const admin = useAdminAuthStore((s) => s.admin);
  const isSuperAdmin = admin?.role === "super_admin";
  const [admins, setAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "support", password: "" });
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ admins: SubAdmin[] }>("/admin/admins");
      setAdmins(data.admins || []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.role) {
      toast.error("Email, password and role are required."); return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setCreating(true);
    try {
      await api.post("/admin/admins", form);
      toast.success(`${ROLE_INFO[form.role as keyof typeof ROLE_INFO]?.label || form.role} account created`);
      setForm({ email: "", name: "", role: "support", password: "" });
      setShowCreate(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create admin.");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/admins/${id}/role`, { role: newRole });
      toast.success("Role updated.");
      load();
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate ${name}? They will lose access immediately.`)) return;
    setUpdatingId(id);
    try {
      await api.delete(`/admin/admins/${id}`);
      toast.success("Admin deactivated.");
      load();
    } catch {
      toast.error("Failed to deactivate admin.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="font-inter space-y-6">

      {/* Role descriptions */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(ROLE_INFO).map(([key, info]) => (
          <div key={key} className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
                {info.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">{info.access}</p>
          </div>
        ))}
      </div>

      {/* Team list */}
      <div className="bg-white rounded-xl border">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Admin team ({admins.length})</h2>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="text-sm px-4 py-2 bg-pry text-white rounded-lg font-medium"
            >
              + Add admin
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && isSuperAdmin && (
          <div className="p-4 bg-gray-50 border-b space-y-3">
            <h3 className="font-medium text-sm">New admin account</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email *</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Password *</label>
                <input
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  type="password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
                >
                  <option value="support">Support Admin</option>
                  <option value="finance">Finance Admin</option>
                  <option value="operations">Operations Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-pry text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create account"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Admin list */}
        {loading ? (
          <p className="p-4 text-gray-500 text-sm">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 text-xs border-b">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="px-4">Email</th>
                <th className="px-4">Role</th>
                <th className="px-4">Status</th>
                <th className="px-4">Joined</th>
                {isSuperAdmin && <th className="px-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const roleInfo = ROLE_INFO[a.adminRole as keyof typeof ROLE_INFO];
                const isCurrentUser = a._id === admin?.id;
                return (
                  <tr key={a._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {a.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-gray-400">(you)</span>
                      )}
                    </td>
                    <td className="px-4 text-gray-500">{a.email}</td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo?.color || "bg-gray-100 text-gray-600"}`}>
                        {roleInfo?.label || a.adminRole}
                      </span>
                    </td>
                    <td className="px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.adminStatus === "inactive"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {a.adminStatus === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 text-gray-400 text-xs">
                      {new Date(a.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4">
                        {!isCurrentUser && a.adminRole !== "super_admin" && (
                          <div className="flex gap-2">
                            <select
                              value={a.adminRole}
                              onChange={(e) => handleRoleChange(a._id, e.target.value)}
                              disabled={updatingId === a._id}
                              className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                            >
                              <option value="support">Support</option>
                              <option value="finance">Finance</option>
                              <option value="operations">Operations</option>
                            </select>
                            {a.adminStatus !== "inactive" && (
                              <button
                                onClick={() => handleDeactivate(a._id, a.name)}
                                disabled={updatingId === a._id}
                                className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Access guide */}
      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <strong>Your role:</strong> {ROLE_INFO[admin?.role as keyof typeof ROLE_INFO]?.label || admin?.role}
            <br />
            <strong>Your access:</strong> {ROLE_INFO[admin?.role as keyof typeof ROLE_INFO]?.access}
            <br />
            Contact your super admin to change your role or grant additional access.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamAD;
