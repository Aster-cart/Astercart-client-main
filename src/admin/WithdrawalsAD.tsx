import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-600",
  PAID: "bg-green-100 text-green-700",
};

interface CoveredWeek {
  weekStart: string;
  weekEnd: string;
  amount: number;
}

interface WithdrawalRequest {
  _id: string;
  userId: { _id: string; name?: string; email?: string } | string;
  userType: "STORE" | "RIDER";
  amount: number;
  coveredWeeks: CoveredWeek[];
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  requestedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  notes: string | null;
}

const WithdrawalsAD: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      if (userTypeFilter) params.set("userType", userTypeFilter);
      const { data } = await api.get(`/admin/withdrawals?${params.toString()}`);
      setRequests(data.requests || []);
    } catch {
      toast.error("Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }, [filter, userTypeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id: string, action: "approve" | "reject" | "mark-paid") => {
    setActionLoading(id);
    try {
      const body: Record<string, string> = {};
      if (notes[id]) body.notes = notes[id];
      const labels: Record<string, string> = {
        approve: "approved",
        reject: "rejected",
        "mark-paid": "marked as paid",
      };
      await api.put(`/admin/withdrawals/${id}/${action}`, body);
      toast.success(`Withdrawal ${labels[action]}.`);
      setNotes((prev) => { const next = { ...prev }; delete next[id]; return next; });
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action}.`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const formatWeekShort = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}/${e.getFullYear()}`;
  };

  const weeksLabel = (cw: CoveredWeek[]) => {
    if (!cw || cw.length === 0) return "—";
    if (cw.length === 1) return formatWeekShort(cw[0].weekStart, cw[0].weekEnd);
    return `${cw.length} weeks (${formatWeekShort(cw[0].weekStart, cw[cw.length - 1].weekEnd)})`;
  };

  const getUserLabel = (r: WithdrawalRequest) => {
    const u = r.userId;
    if (typeof u === "object" && u !== null) return u.name || u.email || u._id;
    return String(u);
  };

  if (loading) return <div className="text-center py-8 text-muted">Loading...</div>;

  return (
    <div className="font-inter">
      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="PAID">PAID</option>
        </select>
        <select
          value={userTypeFilter}
          onChange={(e) => setUserTypeFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All types</option>
          <option value="STORE">Stores</option>
          <option value="RIDER">Riders</option>
        </select>
        <span className="text-sm text-muted self-center">{requests.length} request(s)</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-muted border-b text-xs">
            <tr>
              <th className="py-3 px-2">Store/Rider</th>
              <th className="px-2">Weeks Covered</th>
              <th className="px-2">Amount</th>
              <th className="px-2">Bank Details</th>
              <th className="px-2">Status</th>
              <th className="px-2">Requested</th>
              <th className="px-2">Notes</th>
              <th className="px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted">No withdrawal requests found.</td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id} className="border-b hover:bg-off-white">
                  <td className="py-3 px-2 text-xs">{getUserLabel(r)}</td>
                  <td className="py-3 px-2 text-xs whitespace-nowrap">{weeksLabel(r.coveredWeeks)}</td>
                  <td className="px-2 font-medium">{formatNaira(r.amount)}</td>
                  <td className="px-2 text-xs">
                    {r.bankName}<br />
                    {r.accountName}<br />
                    {r.accountNumber}
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLOR[r.status] || ""}`}>
                      {r.status}
                    </span>
                    {r.status === "APPROVED" && r.approvedAt && (
                      <p className="text-xs text-muted mt-1">{formatDate(r.approvedAt)}</p>
                    )}
                    {r.status === "PAID" && r.paidAt && (
                      <p className="text-xs text-muted mt-1">{formatDate(r.paidAt)}</p>
                    )}
                  </td>
                  <td className="px-2 text-xs text-muted whitespace-nowrap">{formatDate(r.requestedAt)}</td>
                  <td className="px-2">
                    <input
                      type="text"
                      value={notes[r._id] || ""}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [r._id]: e.target.value }))}
                      placeholder="Add note..."
                      className="w-28 border border-border rounded px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2">
                    <div className="flex gap-1 flex-wrap">
                      {r.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleAction(r._id, "approve")}
                            disabled={actionLoading === r._id}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            {actionLoading === r._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleAction(r._id, "reject")}
                            disabled={actionLoading === r._id}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            {actionLoading === r._id ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {r.status === "APPROVED" && (
                        <button
                          onClick={() => handleAction(r._id, "mark-paid")}
                          disabled={actionLoading === r._id}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {actionLoading === r._id ? "..." : "Mark Paid"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalsAD;
