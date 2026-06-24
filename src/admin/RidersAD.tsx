import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Rider {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  riderStatus: "available" | "busy" | "offline";
  riderDetails?: { vehicleType?: string; licenseNumber?: string };
  totalDeliveries: number;
  rating: number;
  isBlocked: boolean;
  createdAt: string;
}

const STATUS_COLOR = {
  available: "bg-green-100 text-green-700",
  busy: "bg-yellow-100 text-yellow-700",
  offline: "bg-gray-100 text-gray-500",
};

const RidersAD: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "busy" | "offline">("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ riders: Rider[] }>("/admin/riders");
      setRiders(data.riders || []);
    } catch { setRiders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleBlock = async (id: string, isBlocked: boolean) => {
    setActionId(id);
    try {
      await api.put(`/admin/riders/${id}/${isBlocked ? "unblock" : "block"}`);
      toast.success(isBlocked ? "Rider unblocked" : "Rider blocked");
      load();
    } catch { toast.error("Action failed."); }
    finally { setActionId(null); }
  };

  const filtered = riders.filter(r => filter === "all" || r.riderStatus === filter);

  const counts = {
    available: riders.filter(r => r.riderStatus === "available").length,
    busy: riders.filter(r => r.riderStatus === "busy").length,
    offline: riders.filter(r => r.riderStatus === "offline").length,
  };

  if (loading) return <p className="p-8 text-gray-400">Loading riders...</p>;

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Total riders</p>
          <p className="text-2xl font-bold mt-1">{riders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Available now</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{counts.available}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">On delivery</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{counts.busy}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Offline</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{counts.offline}</p>
        </div>
      </div>

      {riders.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-800">
            No riders registered yet. Riders sign up through the rider section of the mobile app
            using the same login screen with "Rider" account type.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "available", "busy", "offline"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium border ${filter === f ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b text-xs bg-gray-50">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="px-4">Contact</th>
              <th className="px-4">Vehicle</th>
              <th className="px-4">Status</th>
              <th className="px-4">Deliveries</th>
              <th className="px-4">Rating</th>
              <th className="px-4">Joined</th>
              <th className="px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No riders found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{r.name}</td>
                <td className="px-4 text-gray-500 text-xs">
                  {r.email}<br/>{r.phoneNumber || "—"}
                </td>
                <td className="px-4">{r.riderDetails?.vehicleType || "—"}</td>
                <td className="px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[r.riderStatus]}`}>
                    {r.riderStatus}
                  </span>
                </td>
                <td className="px-4 font-medium">{r.totalDeliveries}</td>
                <td className="px-4">⭐ {r.rating?.toFixed(1) || "5.0"}</td>
                <td className="px-4 text-gray-400 text-xs">
                  {new Date(r.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4">
                  <button
                    onClick={() => handleBlock(r._id, r.isBlocked)}
                    disabled={actionId === r._id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium ${r.isBlocked ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
                  >
                    {r.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RidersAD;
