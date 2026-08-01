import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { useAdminAuthStore, canAccess } from "../store/adminAuthStore";

interface AuditLog {
  _id: string;
  action: string;
  performedBy?: { name?: string; email?: string } | string | null;
  performedByType?: string;
  referenceId?: string;
  referenceModel?: string;
  before?: any;
  after?: any;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

const ACTION_LABELS: Record<string, string> = {
  payment_verified: "Payment Verified",
  payment_verified_orphan: "Payment Verified (Orphan)",
  payment_recovered: "Payment Recovered",
  payment_verification_failed: "Payment Verification Failed",
  payment_not_confirmed: "Payment Not Confirmed",
  refund: "Refund Initiated",
  refund_completed_manual: "Refund Completed (Manual)",
  cannot_fulfill: "Order Cannot Fulfill",
  withdrawal_request: "Withdrawal Requested",
  withdrawal_approve: "Withdrawal Approved",
  withdrawal_reject: "Withdrawal Rejected",
  withdrawal_paid: "Withdrawal Paid",
  rider_verification: "Rider Verification",
  store_verification: "Store Verification",
  store_status_update: "Store Status Update",
  rider_status_update: "Rider Status Update",
  product_created: "Product Created",
  product_updated: "Product Updated",
  product_deleted: "Product Deleted",
  product_status_change: "Product Status Change",
  platform_config_update: "Platform Config Updated",
  admin_created: "Admin Created",
  admin_role_updated: "Admin Role Updated",
  settlement_status_update: "Settlement Status Updated",
  support_ticket_created: "Support Ticket Created",
  support_ticket_updated: "Support Ticket Updated",
};

const AuditLogsAD: React.FC = () => {
  const admin = useAdminAuthStore((s) => s.admin);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [referenceModel, setReferenceModel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (action) params.action = action;
      if (referenceModel) params.referenceModel = referenceModel;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get("/admin/audit-logs", { params });
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotal(data.total || 0);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, action, referenceModel, from, to]);

  useEffect(() => { load(); }, [load]);

  if (!canAccess(admin?.role, "reports")) {
    return <p className="text-muted p-4">You don't have permission to view audit logs.</p>;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const actorName = (log: AuditLog) => {
    if (log.performedBy && typeof log.performedBy === "object") {
      return log.performedBy.name || log.performedBy.email || "System";
    }
    return log.performedByType || "System";
  };

  return (
    <div className="font-inter space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-muted mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search action or notes…"
            className="w-full border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Action</label>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Reference</label>
          <select value={referenceModel} onChange={(e) => { setReferenceModel(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="Transaction">Transaction</option>
            <option value="Store">Store</option>
            <option value="Rider">Rider</option>
            <option value="User">User</option>
            <option value="Product">Product</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-1.5 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Audit trail</h2>
          <span className="text-sm text-muted">{total.toLocaleString()} records</span>
        </div>
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-muted text-sm">No audit records found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-muted border-b text-xs">
              <tr>
                <th className="py-2">Time</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Reference</th>
                <th>Notes</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b hover:bg-off-white">
                  <td className="py-2.5 text-muted text-xs whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-body whitespace-nowrap">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td>{actorName(log)}</td>
                  <td className="text-muted text-xs whitespace-nowrap">
                    {log.referenceModel ? `${log.referenceModel} · ${(log.referenceId || "").toString().slice(-8).toUpperCase()}` : "—"}
                  </td>
                  <td className="text-xs max-w-[260px] truncate" title={log.notes}>{log.notes || "—"}</td>
                  <td>
                    {(log.before || log.after) && (
                      <button
                        onClick={() => setExpanded((s) => ({ ...s, [log._id]: !s[log._id] }))}
                        className="text-xs px-2 py-1 bg-gray-100 text-body rounded-lg hover:bg-gray-200"
                      >
                        {expanded[log._id] ? "Hide" : "View"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Expanded JSON details */}
        {logs.map((log) => expanded[log._id] && (
          <div key={`${log._id}-detail`} className="border rounded-lg p-3 mt-2 bg-gray-50 text-xs space-y-2 overflow-x-auto">
            {log.before && (
              <div>
                <p className="font-semibold text-muted mb-1">Before:</p>
                <pre className="bg-white border rounded p-2">{JSON.stringify(log.before, null, 2)}</pre>
              </div>
            )}
            {log.after && (
              <div>
                <p className="font-semibold text-muted mb-1">After:</p>
                <pre className="bg-white border rounded p-2">{JSON.stringify(log.after, null, 2)}</pre>
              </div>
            )}
            {log.ipAddress && <p><span className="text-muted">IP:</span> {log.ipAddress}</p>}
            {log.userAgent && <p className="truncate"><span className="text-muted">UA:</span> {log.userAgent}</p>}
          </div>
        ))}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted">Per page</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1 text-xs">
                {[20, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="text-xs text-muted">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsAD;
