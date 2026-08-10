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
  bankAccount?: { bankName: string; accountName: string; accountNumber: string };
  pendingBankUpdate?: {
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    requestedAt: string | null;
  };
}

interface PendingBankApproval {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bankAccount?: { bankName: string; accountName: string; accountNumber: string };
  pendingBankUpdate?: {
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    requestedAt: string | null;
  };
}

interface PendingRiderVerification {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  riderVerificationStatus: string;
  riderVerificationNotes?: string | null;
  createdAt: string;
  riderVerification?: {
    governmentId?: string;
    selfie?: string;
    vehicleType?: string;
    vehicleModel?: string;
    numberPlate?: string;
    submittedAt?: string;
  };
}

const STATUS_COLOR = {
  available: "bg-green-100 text-green-700",
  busy: "bg-yellow-100 text-yellow-700",
  offline: "bg-gray-100 text-muted",
};

const RidersAD: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "busy" | "offline">("all");
  const [pendingVerifications, setPendingVerifications] = useState<PendingRiderVerification[]>([]);
  const [pendingBankApprovals, setPendingBankApprovals] = useState<PendingBankApproval[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [showVerificationTab, setShowVerificationTab] = useState(false);
  const [showBankTab, setShowBankTab] = useState(false);
  const [bankActionId, setBankActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ridersRes, verifRes, bankRes] = await Promise.allSettled([
        api.get<{ riders: Rider[] }>("/admin/riders"),
        api.get<{ riders: PendingRiderVerification[] }>("/rider/admin/verifications?status=pending"),
        api.get<{ riders: PendingBankApproval[] }>("/admin/riders/bank-approvals"),
      ]);
      if (ridersRes.status === "fulfilled") setRiders(ridersRes.value.data.riders || []);
      if (verifRes.status === "fulfilled") setPendingVerifications(verifRes.value.data.riders || []);
      if (bankRes.status === "fulfilled") setPendingBankApprovals(bankRes.value.data.riders || []);
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

  const reviewVerification = async (riderId: string, decision: "verified" | "rejected") => {
    const note = reviewNotes[riderId] || "";
    if (decision === "rejected" && !note.trim()) {
      toast.error("Please add a note explaining what needs correcting before rejecting.");
      return;
    }
    setReviewingId(riderId);
    try {
      await api.put(`/rider/admin/verifications/${riderId}`, { decision, note });
      toast.success(`Rider ${decision === "verified" ? "verified" : "rejected"} successfully.`);
      setReviewNotes(prev => { const n = { ...prev }; delete n[riderId]; return n; });
      load();
    } catch {
      toast.error("Review action failed.");
    } finally {
      setReviewingId(null);
    }
  };

  const handleBankAction = async (riderId: string, action: "approve" | "reject") => {
    setBankActionId(riderId);
    try {
      await api.put(`/admin/riders/${riderId}/${action === "approve" ? "approve-bank" : "reject-bank"}`);
      toast.success(action === "approve" ? "Bank details approved. Payouts will now use this account." : "Pending bank update cleared.");
      load();
    } catch {
      toast.error("Bank action failed.");
    } finally {
      setBankActionId(null);
    }
  };

  const filtered = riders.filter(r => filter === "all" || r.riderStatus === filter);

  const counts = {
    available: riders.filter(r => r.riderStatus === "available").length,
    busy: riders.filter(r => r.riderStatus === "busy").length,
    offline: riders.filter(r => r.riderStatus === "offline").length,
  };

  if (loading) return <p className="p-8 text-muted">Loading riders...</p>;

  return (
    <div className="font-inter">
      {/* Tab switcher — Riders list vs Verification queue */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => { setShowVerificationTab(false); setShowBankTab(false); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${!showVerificationTab && !showBankTab ? "border-pry text-pry" : "border-transparent text-muted"}`}
        >
          All Riders
        </button>
        <button
          onClick={() => { setShowVerificationTab(true); setShowBankTab(false); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${showVerificationTab ? "border-pry text-pry" : "border-transparent text-muted"}`}
        >
          Verification Queue
          {pendingVerifications.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingVerifications.length}</span>
          )}
        </button>
        <button
          onClick={() => { setShowBankTab(true); setShowVerificationTab(false); }}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${showBankTab ? "border-pry text-pry" : "border-transparent text-muted"}`}
        >
          Bank Approvals
          {pendingBankApprovals.length > 0 && <span className="bg-pry text-white text-xs rounded-full px-2 py-0.5">{pendingBankApprovals.length}</span>}
        </button>
      </div>

      {showBankTab ? (
        <div>
          <p className="text-sm text-muted mb-4">
            Riders who have submitted bank details. Approving makes this the account used for payouts;
            rejecting clears the request so the rider can resubmit.
          </p>
          {pendingBankApprovals.length === 0 ? (
            <p className="text-center text-muted py-12">No pending bank approvals right now.</p>
          ) : pendingBankApprovals.map((r) => (
            <div key={r._id} className="bg-white rounded-xl border p-5 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted">{r.email}</p>
                  {r.pendingBankUpdate?.requestedAt && (
                    <p className="text-xs text-muted">
                      Submitted: {new Date(r.pendingBankUpdate.requestedAt).toLocaleString("en-GB")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-off-white rounded-lg p-3">
                <div><span className="text-muted">Bank: </span>{r.pendingBankUpdate?.bankName || "—"}</div>
                <div><span className="text-muted">Account No: </span>{r.pendingBankUpdate?.accountNumber || "—"}</div>
                <div className="col-span-2"><span className="text-muted">Account Name: </span>{r.pendingBankUpdate?.accountName || "—"}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleBankAction(r._id, "approve")}
                  disabled={bankActionId === r._id}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {bankActionId === r._id ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => handleBankAction(r._id, "reject")}
                  disabled={bankActionId === r._id}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {bankActionId === r._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : showVerificationTab ? (
        <div>
          <p className="text-sm text-muted mb-4">
            These riders have submitted their documents and are waiting for your review before they can go online.
          </p>
          {pendingVerifications.length === 0 ? (
            <p className="text-center text-muted py-12">No pending verifications right now.</p>
          ) : pendingVerifications.map((r) => (
            <div key={r._id} className="bg-white rounded-xl border p-5 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted">{r.email}</p>
                  {r.phoneNumber && <p className="text-xs text-muted">{r.phoneNumber}</p>}
                  {r.riderVerification?.submittedAt && (
                    <p className="text-xs text-muted">Submitted: {new Date(r.riderVerification.submittedAt).toLocaleDateString("en-GB")}</p>
                  )}
                </div>
              </div>

              {r.riderVerification && (
                <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-off-white rounded-lg p-3">
                  <div><span className="text-muted">Vehicle: </span>{r.riderVerification.vehicleType || "—"}</div>
                  <div><span className="text-muted">Model: </span>{r.riderVerification.vehicleModel || "—"}</div>
                  <div><span className="text-muted">Number Plate: </span>{r.riderVerification.numberPlate || "—"}</div>
                  <div className="col-span-2 flex gap-4">
                    {r.riderVerification.governmentId && (
                      <div>
                        <span className="text-muted">Government ID: </span>
                        <a href={r.riderVerification.governmentId} target="_blank" rel="noopener noreferrer"
                          className="text-pry underline">View</a>
                      </div>
                    )}
                    {r.riderVerification.selfie && (
                      <div>
                        <span className="text-muted">Selfie: </span>
                        <a href={r.riderVerification.selfie} target="_blank" rel="noopener noreferrer"
                          className="text-pry underline">View</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <input
                placeholder="Rejection note (required if rejecting — explain what needs correcting)"
                value={reviewNotes[r._id] || ""}
                onChange={e => setReviewNotes(prev => ({ ...prev, [r._id]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-pry"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => reviewVerification(r._id, "verified")}
                  disabled={reviewingId === r._id}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {reviewingId === r._id ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => reviewVerification(r._id, "rejected")}
                  disabled={reviewingId === r._id}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {reviewingId === r._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-muted">Total riders</p>
          <p className="text-2xl font-bold mt-1">{riders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-muted">Available now</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{counts.available}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-muted">On delivery</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{counts.busy}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-muted">Offline</p>
          <p className="text-2xl font-bold text-muted mt-1">{counts.offline}</p>
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
            className={`px-4 py-2 rounded-full text-xs font-medium border ${filter === f ? "bg-pry text-white border-pry" : "text-muted border-border"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-muted border-b text-xs bg-off-white">
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
              <tr><td colSpan={8} className="text-center py-8 text-muted">No riders found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r._id} className="border-b hover:bg-off-white">
                <td className="py-3 px-4 font-medium">{r.name}</td>
                <td className="px-4 text-muted text-xs">
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
                <td className="px-4 text-muted text-xs">
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
      </>
      )}
    </div>
  );
};

export default RidersAD;
