import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import StoreDetailAD from "./StoreDetailAD";

interface StoreRow {
  storeId: string;
  name: string;
  email: string;
  state: string;
  status: string;
  createdAt: string;
  orderCount?: number;
  revenue?: number;
  cacNumber?: string;
}

const StoresAD: React.FC = () => {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "inactive">("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ stores: StoreRow[] }>("/store/adminstore");
      setStores(data.stores || []);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // If a store is selected, show its detail page
  if (selectedStoreId) {
    return (
      <StoreDetailAD
        storeId={selectedStoreId}
        onBack={() => setSelectedStoreId(null)}
      />
    );
  }

  const setStatus = async (id: string, action: "block" | "unblock") => {
    try {
      await api.put(`/store/adminstore/${id}/${action}`);
      toast.success(action === "block" ? "Store blocked" : "Store activated");
      load();
    } catch {
      toast.error("Action failed");
    }
  };

  const filtered = stores.filter((s) =>
    filter === "all" ? true : s.status === filter
  );

  const pending = stores.filter((s) => s.status === "pending").length;
  const active = stores.filter((s) => s.status === "active").length;
  const inactive = stores.filter((s) => s.status === "inactive").length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      inactive: "bg-red-100 text-red-600",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending approval", value: pending, color: "text-yellow-600" },
          { label: "Active stores", value: active, color: "text-green-600" },
          { label: "Blocked stores", value: inactive, color: "text-red-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs border font-medium ${
              filter === f ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pending > 0 && (
              <span className="ml-1 bg-yellow-400 text-white rounded-full px-1.5 py-0.5 text-xs">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading stores…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No stores found.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-4">Store name</th>
                <th className="px-4">Email</th>
                <th className="px-4">State</th>
                <th className="px-4">Status</th>
                <th className="px-4">Orders / Revenue</th>
                <th className="px-4">Joined / CAC</th>
                <th className="px-4">Orders</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.storeId}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td
                    className="py-3 px-4 font-medium text-pry hover:underline"
                    onClick={() => setSelectedStoreId(s.storeId)}
                  >
                    {s.name}
                  </td>
                  <td className="px-4 text-gray-500">{s.email}</td>
                  <td className="px-4 text-gray-500">{s.state || "—"}</td>
                  <td className="px-4">{statusBadge(s.status)}</td>
                  <td className="px-4 text-gray-400 text-xs">
                    {new Date(s.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedStoreId(s.storeId)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
                      >
                        View
                      </button>
                      {s.status === "pending" && (
                        <button
                          onClick={() => setStatus(s.storeId, "unblock")}
                          className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-medium"
                        >
                          Approve
                        </button>
                      )}
                      {s.status === "active" && (
                        <button
                          onClick={() => setStatus(s.storeId, "block")}
                          className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg font-medium"
                        >
                          Block
                        </button>
                      )}
                      {s.status === "inactive" && (
                        <button
                          onClick={() => setStatus(s.storeId, "unblock")}
                          className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg font-medium"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoresAD;
