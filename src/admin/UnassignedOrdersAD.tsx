import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

interface UnassignedOrder {
  _id: string;
  orderNumber: string;
  customer: { _id: string; name: string; email: string; phoneNumber: string };
  storeName: string;
  totalAmount: number;
  grandTotal: number;
  createdAt: string;
  waitingMinutes: number;
  broadcastCount: number;
  currentSearchRadiusKm: number;
  nearbyRiders: number;
  needsAttention: boolean;
  needsAttentionAt: string | null;
  reason: string | null;
  lastBroadcastAt: string | null;
}

interface NearbyRider { _id: string; name: string; phoneNumber: string; distanceKm: number }

const fmtNaira = (n: number) => "₦" + (n || 0).toLocaleString();

export default function UnassignedOrdersAD() {
  const [orders, setOrders] = useState<UnassignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  // Expanded row data: orderId -> nearby riders for manual assign + customer contact
  const [expanded, setExpanded] = useState<Record<string, NearbyRider[] | undefined>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ orders: UnassignedOrder[] }>("/adminOrder/unassigned");
      setOrders(data.orders || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load unassigned orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (id: string) => {
    if (expanded[id]) {
      // already loaded → close it
      setExpanded((prev) => { const next = { ...prev }; delete next[id]; return next; });
      return;
    }
    // opening → fetch nearby riders
    setExpanded((prev) => ({ ...prev, [id]: [] }));
    try {
      const { data } = await api.get<{ customer: any; nearbyRiders: NearbyRider[] }>(`/adminOrder/unassigned/${id}/customer`);
      setExpanded((prev) => ({ ...prev, [id]: data.nearbyRiders || [] }));
    } catch {
      setExpanded((prev) => ({ ...prev, [id]: [] }));
    }
  };

  const act = async (label: string, path: string, method: "put" = "put", body?: any) => {
    try {
      await api({ method, url: `/adminOrder${path}`, data: body });
      toast.success(`${label} done.`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `${label} failed.`);
    }
  };

  const assignRider = async (orderId: string, riderId: string) => {
    if (!riderId) { toast.error("Select a rider first."); return; }
    try {
      await api.put(`/adminOrder/unassigned/${orderId}/assign`, { riderId });
      toast.success("Rider assigned.");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Assignment failed.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">
          Orders currently searching for a rider. The engine never auto-cancels — action is yours.
          {orders.filter((o) => o.needsAttention).length > 0 && (
            <span className="ml-2 text-red-600 font-semibold">
              {orders.filter((o) => o.needsAttention).length} need attention
            </span>
          )}
        </p>
        <button onClick={load} className="bg-pry text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted py-12">Loading unassigned orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted py-12 bg-white rounded-xl border border-border">
          No unassigned orders right now.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-off-white text-muted uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Store</th>
                <th className="text-left px-4 py-3">Value</th>
                <th className="text-center px-4 py-3">Waiting</th>
                <th className="text-center px-4 py-3">Broadcasts</th>
                <th className="text-center px-4 py-3">Radius</th>
                <th className="text-center px-4 py-3">Nearby</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o._id}>
                  <tr className={`border-t border-border ${o.needsAttention ? "bg-amber-50" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs">
                      <button className="text-pry hover:underline" onClick={() => toggleExpand(o._id)}>
                        {o.orderNumber.slice(0, 8)}…
                      </button>
                      {o.needsAttention && <span className="ml-2 text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded">ATTN</span>}
                    </td>
                    <td className="px-4 py-3">{o.customer.name}</td>
                    <td className="px-4 py-3">{o.storeName}</td>
                    <td className="px-4 py-3">{fmtNaira(o.grandTotal)}</td>
                    <td className="px-4 py-3 text-center">{o.waitingMinutes}m</td>
                    <td className="px-4 py-3 text-center">{o.broadcastCount}</td>
                    <td className="px-4 py-3 text-center">{o.currentSearchRadiusKm} km</td>
                    <td className="px-4 py-3 text-center">{o.nearbyRiders}</td>
                    <td className="px-4 py-3 text-muted text-xs max-w-[200px]">{o.reason || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => act("Rebroadcast", `/unassigned/${o._id}/rebroadcast`)} className="text-xs bg-pry text-white px-2 py-1 rounded">Rebroadcast</button>
                        <button onClick={() => act("Radius widened", `/unassigned/${o._id}/expand-radius`)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Expand radius</button>
                        <button onClick={() => toggleExpand(o._id)} className="text-xs bg-slate-600 text-white px-2 py-1 rounded">Assign</button>
                        <button onClick={() => { alert(`Customer:\n${o.customer.name}\nPhone: ${o.customer.phoneNumber || "—"}\nEmail: ${o.customer.email || "—"}`); }} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Contact</button>
                        <button
                          onClick={() => { if (window.confirm("Cancel this order? A refund is processed separately.")) act("Cancelled", `/unassigned/${o._id}/cancel`); }}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                        >Cancel</button>
                      </div>
                    </td>
                  </tr>
                  {expanded[o._id] !== undefined && (
                    <tr className="border-t border-border bg-slate-50">
                      <td colSpan={10} className="px-4 py-4">
                        {expanded[o._id]!.length === 0 ? (
                          <p className="text-sm text-muted">No available verified riders within the current search radius.</p>
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-ink mb-2">Pick a rider to assign:</p>
                            <div className="flex flex-wrap gap-2">
                              {expanded[o._id]!.map((r) => (
                                <button
                                  key={r._id}
                                  onClick={() => assignRider(o._id, r._id)}
                                  className="text-xs bg-ink text-white px-3 py-2 rounded-lg hover:bg-pry transition-colors"
                                >
                                  {r.name} · {r.distanceKm} km · {r.phoneNumber || "no phone"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}