import React, { useEffect, useState } from "react";
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

interface BalanceInfo {
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  bankAccount: { bankName: string; accountName: string; accountNumber: string } | null;
  unpaidWeekCount?: number;
}

const Withdrawals: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [balRes, reqRes] = await Promise.all([
        api.get("/store/withdrawals/balance"),
        api.get("/store/withdrawals"),
      ]);
      setBalance(balRes.data);
      setRequests(reqRes.data.requests || []);
    } catch {
      toast.error("Failed to load withdrawal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestPayout = async () => {
    setSubmitting(true);
    try {
      await api.post("/store/withdrawals", {});
      toast.success("Weekly payout requested.");
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request payout.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

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

  if (loading) return <div className="text-center py-8 text-muted">Loading...</div>;

  const hasPending = requests.some((r) => r.status === "PENDING" || r.status === "APPROVED");
  const avail = balance?.availableBalance || 0;
  const weekCount = balance?.unpaidWeekCount || 0;

  return (
    <div className="font-inter pb-8">
      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available for payout", value: formatNaira(avail), color: "text-green-600" },
          { label: "Pending Withdrawal", value: formatNaira(balance?.pendingBalance || 0), color: "text-yellow-600" },
          { label: "Total Withdrawn", value: formatNaira(balance?.totalWithdrawn || 0), color: "text-blue-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-muted mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly payout request */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h3 className="font-semibold mb-2">Request Weekly Payout</h3>
        <p className="text-sm text-muted mb-4">
          Payouts are processed weekly (Monday – Sunday). All completed unpaid weeks are bundled
          into a single payout request — one approval, one transfer, one audit trail.
          {weekCount > 1 && (
            <span className="font-medium"> {weekCount} completed week{weekCount > 1 ? "s" : ""} ready for payout.</span>
          )}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-xs text-green-700 mb-1">
              Available{weekCount > 1 ? ` (${weekCount} weeks)` : ""}
            </p>
            <p className="text-2xl font-bold text-green-600">{formatNaira(avail)}</p>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={hasPending || avail <= 0 || submitting}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-colors ${
              hasPending || avail <= 0
                ? "bg-gray-200 text-muted cursor-not-allowed"
                : "bg-pry text-white hover:bg-orange-600"
            }`}
          >
            {submitting ? "Requesting..." : hasPending ? "Pending request — wait" : "Request Weekly Payout"}
          </button>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-4">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-muted border-b text-xs">
              <tr>
                <th className="py-3 px-2">Weeks Covered</th>
                <th className="px-2">Amount</th>
                <th className="px-2">Bank</th>
                <th className="px-2">Account</th>
                <th className="px-2">Status</th>
                <th className="px-2">Requested</th>
                <th className="px-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted">No payout requests yet.</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-off-white">
                    <td className="py-3 px-2 text-xs whitespace-nowrap">{weeksLabel(r.coveredWeeks)}</td>
                    <td className="px-2 font-medium">{formatNaira(r.amount)}</td>
                    <td className="px-2">{r.bankName}</td>
                    <td className="px-2 text-xs">{r.accountName} ({r.accountNumber})</td>
                    <td className="px-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLOR[r.status] || ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 text-xs text-muted whitespace-nowrap">{formatDate(r.requestedAt)}</td>
                    <td className="px-2 text-xs text-muted">{r.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
