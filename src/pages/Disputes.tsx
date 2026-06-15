import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface Dispute {
  _id: string;
  customerName: string;
  email?: string;
  phone?: string;
  orderId?: string;
  issueType: string;
  description: string;
  status: "open" | "under_review" | "resolved" | "rejected";
  storeNote?: string;
  adminNote?: string;
  createdAt: string;
}

const STATUS_COLOR = {
  open: "bg-red-100 text-red-600",
  under_review: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-500",
};

const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [storeNote, setStoreNote] = useState("");
  const [responding, setResponding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ disputes: Dispute[] }>("/store/disputes");
      setDisputes(data.disputes || []);
    } catch { setDisputes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (status: string) => {
    if (!selected) return;
    setResponding(true);
    try {
      await api.put(`/store/disputes/${selected._id}/respond`, { storeNote, status });
      toast.success("Response saved.");
      setSelected(null);
      setStoreNote("");
      load();
    } catch { toast.error("Failed to save response."); }
    finally { setResponding(false); }
  };

  const stats = {
    open: disputes.filter(d => d.status === "open").length,
    under_review: disputes.filter(d => d.status === "under_review").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
  };

  if (loading) return <p className="p-8 text-gray-400">Loading complaints...</p>;

  if (selected) {
    return (
      <div className="font-inter">
        <button onClick={() => { setSelected(null); setStoreNote(""); }}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4">
          ← Back to complaints
        </button>

        <div className="bg-white rounded-xl p-6 border mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold">{selected.issueType}</h2>
              <p className="text-sm text-gray-500">
                From {selected.customerName}
                {selected.orderId ? ` · Order #${selected.orderId}` : ""}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(selected.createdAt).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[selected.status]}`}>
              {selected.status.replace("_", " ")}
            </span>
          </div>

          {/* Customer contact */}
          <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
            {selected.email && <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium">{selected.email}</p></div>}
            {selected.phone && <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium">{selected.phone}</p></div>}
          </div>

          {/* Complaint */}
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-red-500 font-medium mb-1">Customer's complaint</p>
            <p className="text-sm text-gray-700">{selected.description}</p>
          </div>

          {/* Admin note if any */}
          {selected.adminNote && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-blue-500 font-medium mb-1">Admin note</p>
              <p className="text-sm text-blue-800">{selected.adminNote}</p>
            </div>
          )}

          {/* Store response */}
          {selected.status !== "resolved" && selected.status !== "rejected" && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Your response to this complaint
              </label>
              <textarea
                value={storeNote}
                onChange={e => setStoreNote(e.target.value)}
                rows={4}
                placeholder="Explain what happened, how you will resolve it, or your position..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-pry resize-none"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleRespond("under_review")}
                  disabled={responding}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium"
                >
                  {responding ? "Saving..." : "Acknowledge & reviewing"}
                </button>
                <button
                  onClick={() => handleRespond("resolved")}
                  disabled={responding}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
                >
                  Mark resolved
                </button>
              </div>
            </div>
          )}

          {selected.storeNote && (
            <div className="bg-green-50 rounded-lg p-4 mt-4">
              <p className="text-xs text-green-600 font-medium mb-1">Your previous response</p>
              <p className="text-sm text-green-800">{selected.storeNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Open complaints", value: stats.open, color: "text-red-600" },
          { label: "Under review", value: stats.under_review, color: "text-yellow-600" },
          { label: "Resolved", value: stats.resolved, color: "text-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>📋 Customer complaints</strong> — These are disputes submitted by customers
          about orders from your store. Respond promptly to maintain your store rating.
          Unresolved complaints are also visible to admin.
        </p>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {disputes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-500 font-medium">No complaints yet</p>
            <p className="text-xs text-gray-400 mt-1">Customer complaints about your store will appear here</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs bg-gray-50">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="px-4">Issue</th>
                <th className="px-4">Order</th>
                <th className="px-4">Status</th>
                <th className="px-4">Date</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d._id} className={`border-b hover:bg-gray-50 ${d.status === "open" ? "bg-red-50" : ""}`}>
                  <td className="py-3 px-4 font-medium">{d.customerName}</td>
                  <td className="px-4">{d.issueType}</td>
                  <td className="px-4 text-gray-500 text-xs">{d.orderId ? `#${d.orderId}` : "—"}</td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[d.status]}`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 text-gray-400 text-xs">
                    {new Date(d.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4">
                    <button
                      onClick={() => { setSelected(d); setStoreNote(d.storeNote || ""); }}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                    >
                      {d.status === "open" ? "⚠ Respond" : "View"}
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

export default Disputes;
