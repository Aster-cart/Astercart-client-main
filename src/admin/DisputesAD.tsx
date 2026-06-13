import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Dispute {
  _id: string;
  customerId?: string;
  customerName: string;
  storeName: string;
  orderId: string;
  issueType: string;
  description: string;
  status: "open" | "under_review" | "resolved" | "rejected";
  adminNote?: string;
  createdAt: string;
}

const STATUS_COLOR = {
  open: "bg-red-100 text-red-600",
  under_review: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-500",
};

const DisputesAD: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Dispute[]>("/admin/disputes");
        setDisputes(Array.isArray(data) ? data : []);
      } catch { setDisputes([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      await api.put(`/admin/disputes/${id}`, { status, adminNote });
      toast.success(`Dispute marked as ${status}`);
      setDisputes(prev => prev.map(d => d._id === id ? { ...d, status: status as any, adminNote } : d));
      setSelected(null);
    } catch { toast.error("Failed to update dispute"); }
    finally { setUpdating(false); }
  };

  const stats = {
    open: disputes.filter(d => d.status === "open").length,
    under_review: disputes.filter(d => d.status === "under_review").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
  };

  if (loading) return <p className="p-4 text-gray-500">Loading disputes...</p>;

  if (selected) {
    return (
      <div className="font-inter">
        <button onClick={() => setSelected(null)} className="text-sm text-gray-500 mb-4">← Back</button>
        <div className="bg-white rounded-xl p-6 border mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold">{selected.issueType}</h2>
              <p className="text-sm text-gray-500">
                {selected.customerName} · {selected.storeName} · Order #{selected.orderId?.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[selected.status]}`}>
              {selected.status.replace("_", " ")}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">{selected.description}</p>
          </div>
          {selected.adminNote && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-blue-500 font-medium mb-1">Previous admin note:</p>
              <p className="text-sm text-blue-800">{selected.adminNote}</p>
            </div>
          )}
          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium block mb-1">Admin note (optional)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-pry"
              rows={3}
              placeholder="Add a note visible to the customer..."
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => updateStatus(selected._id, "under_review")} disabled={updating}
              className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg font-medium">
              Mark under review
            </button>
            <button onClick={() => updateStatus(selected._id, "resolved")} disabled={updating}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg font-medium">
              Mark resolved
            </button>
            <button onClick={() => updateStatus(selected._id, "rejected")} disabled={updating}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg font-medium">
              Reject dispute
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Open disputes", value: stats.open, color: "text-red-600" },
          { label: "Under review", value: stats.under_review, color: "text-yellow-600" },
          { label: "Resolved", value: stats.resolved, color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        {disputes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No disputes raised yet.</p>
            <p className="text-xs text-gray-400 mt-2">Disputes submitted through the customer support form will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="px-4">Store</th>
                <th className="px-4">Issue</th>
                <th className="px-4">Status</th>
                <th className="px-4">Date</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{d.customerName}</td>
                  <td className="px-4 text-gray-500">{d.storeName || "—"}</td>
                  <td className="px-4">{d.issueType}</td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[d.status]}`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 text-gray-400 text-xs">
                    {new Date(d.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4">
                    <button onClick={() => { setSelected(d); setAdminNote(d.adminNote || ""); }}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                      Review
                    </button>
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

export default DisputesAD;
