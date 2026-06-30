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
  phoneNumber?: string;
  effectiveCommissionPercent?: number; // the rate this store actually pays right now
  hasCustomCommission?: boolean;       // true if this is an override, false if it's just the platform default
  deliveryFeeOverride?: number | null;
}

type FilterTab = "all" | "pending" | "active" | "inactive";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-red-100 text-red-600",
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

const StoresAD: React.FC = () => {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showVerificationTab, setShowVerificationTab] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [storesRes, verifRes] = await Promise.allSettled([
        api.get<{ stores: StoreRow[] }>("/store/adminstore"),
        api.get<{ stores: any[] }>("/store/admin/verifications?status=pending_review"),
      ]);
      if (storesRes.status === "fulfilled") setStores(storesRes.value.data.stores || []);
      if (verifRes.status === "fulfilled") setPendingVerifications(verifRes.value.data.stores || []);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const reviewVerification = async (storeId: string, decision: "approved" | "rejected") => {
    setReviewingId(storeId);
    try {
      await api.put(`/store/admin/verifications/${storeId}`, { decision, note: reviewNote });
      toast.success(`Store ${decision} successfully.`);
      setReviewNote("");
      load();
    } catch {
      toast.error("Review action failed.");
    } finally {
      setReviewingId(null);
    }
  };

  if (selectedStoreId) {
    return <StoreDetailAD storeId={selectedStoreId} onBack={() => setSelectedStoreId(null)} />;
  }

  const setStatus = async (id: string, action: "block" | "unblock") => {
    setActionId(id);
    try {
      await api.put(`/store/adminstore/${id}/${action}`);
      toast.success(action === "block" ? "Store blocked" : "Store activated");
      load();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionId(null);
    }
  };

  const filtered = stores.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const matchSearch = search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.state || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    pending: stores.filter(s => s.status === "pending").length,
    active: stores.filter(s => s.status === "active").length,
    inactive: stores.filter(s => s.status === "inactive").length,
  };

  return (
    <div className="font-inter">
      {/* Tab switcher — Stores list vs Verification queue */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setShowVerificationTab(false)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${!showVerificationTab ? "border-pry text-pry" : "border-transparent text-gray-400"}`}
        >
          All Stores
        </button>
        <button
          onClick={() => setShowVerificationTab(true)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${showVerificationTab ? "border-pry text-pry" : "border-transparent text-gray-400"}`}
        >
          Verification Queue
          {pendingVerifications.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingVerifications.length}</span>
          )}
        </button>
      </div>

      {showVerificationTab ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            These stores have submitted their documents and are waiting for your review before they can add products.
          </p>
          {pendingVerifications.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No pending verifications right now.</p>
          ) : pendingVerifications.map((store: any) => (
            <div key={store._id} className="bg-white rounded-xl border p-5 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{store.name}</p>
                  <p className="text-xs text-gray-400">{store.email}</p>
                  {store.verificationDocuments?.submittedAt && (
                    <p className="text-xs text-gray-400">Submitted: {new Date(store.verificationDocuments.submittedAt).toLocaleDateString("en-GB")}</p>
                  )}
                </div>
              </div>

              {store.verificationDocuments && (
                <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-gray-50 rounded-lg p-3">
                  <div><span className="text-gray-400">CAC Number: </span>{store.verificationDocuments.cacNumber}</div>
                  <div><span className="text-gray-400">Business Email: </span>{store.verificationDocuments.businessEmail}</div>
                  <div><span className="text-gray-400">Phone: </span>{store.verificationDocuments.businessPhone}</div>
                  <div><span className="text-gray-400">Address: </span>{store.verificationDocuments.exactAddress}</div>
                  {store.verificationDocuments.landmark && (
                    <div><span className="text-gray-400">Landmark: </span>{store.verificationDocuments.landmark}</div>
                  )}
                  {store.verificationDocuments.cacCertificate && (
                    <div>
                      <a href={store.verificationDocuments.cacCertificate} target="_blank" rel="noopener noreferrer"
                        className="text-pry underline">View CAC Certificate</a>
                    </div>
                  )}
                  {store.verificationDocuments.ownerIdDocument && (
                    <div>
                      <a href={store.verificationDocuments.ownerIdDocument} target="_blank" rel="noopener noreferrer"
                        className="text-pry underline">View Owner ID</a>
                    </div>
                  )}
                  {store.verificationDocuments.storePhotos?.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Store Photos: </span>
                      {store.verificationDocuments.storePhotos.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-pry underline mr-2">Photo {i + 1}</a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <input
                placeholder="Rejection note (required if rejecting — explain what needs correcting)"
                value={reviewingId === store._id ? reviewNote : ""}
                onChange={e => { setReviewingId(store._id); setReviewNote(e.target.value); }}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-pry"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => reviewVerification(store._id, "approved")}
                  disabled={reviewingId === store._id}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={() => { if (!reviewNote.trim()) { toast.error("Please add a note explaining what needs correcting before rejecting."); return; } reviewVerification(store._id, "rejected"); }}
                  disabled={reviewingId === store._id}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <>
      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Pending approval</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{counts.pending}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting your review</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Active stores</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{counts.active}</p>
          <p className="text-xs text-gray-400 mt-1">Live on the platform</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Blocked stores</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{counts.inactive}</p>
          <p className="text-xs text-gray-400 mt-1">Currently suspended</p>
        </div>
      </div>

      {/* Search + filter row */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search by name, email or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-pry"
        />
        <div className="flex gap-2">
          {(["all", "pending", "active", "inactive"] as FilterTab[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs border font-medium ${
                filter === f ? "bg-pry text-white border-pry" : "text-gray-500 border-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && counts.pending > 0 && (
                <span className="ml-1 bg-yellow-400 text-white rounded-full px-1.5 text-xs">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Store table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-gray-400 text-sm">Loading stores…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No stores found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs bg-gray-50">
              <tr>
                <th className="py-3 px-4">Store name</th>
                <th className="px-4">Email</th>
                <th className="px-4">State</th>
                <th className="px-4">Status</th>
                <th className="px-4">Commission</th>
                <th className="px-4">Orders</th>
                <th className="px-4">Revenue</th>
                <th className="px-4">Joined</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.storeId} className="border-b hover:bg-gray-50">
                  {/* Clickable store name */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedStoreId(s.storeId)}
                      className="font-medium text-pry hover:underline text-left"
                    >
                      {s.name}
                    </button>
                  </td>
                  <td className="px-4 text-gray-500 text-xs">{s.email}</td>
                  <td className="px-4 text-gray-500">{s.state || "—"}</td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[s.status] || "bg-gray-100 text-gray-500"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.hasCustomCommission ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.effectiveCommissionPercent ?? "—"}%
                    </span>
                    {s.hasCustomCommission && (
                      <p className="text-xs text-purple-400 mt-0.5">Custom rate</p>
                    )}
                  </td>
                  <td className="px-4 font-medium">{s.orderCount || 0}</td>
                  <td className="px-4 text-green-600 font-medium">
                    {s.revenue ? formatNaira(s.revenue) : "—"}
                  </td>
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
                          disabled={actionId === s.storeId}
                          className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg font-medium"
                        >
                          Approve
                        </button>
                      )}
                      {s.status === "active" && (
                        <button
                          onClick={() => setStatus(s.storeId, "block")}
                          disabled={actionId === s.storeId}
                          className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg font-medium"
                        >
                          Block
                        </button>
                      )}
                      {s.status === "inactive" && (
                        <button
                          onClick={() => setStatus(s.storeId, "unblock")}
                          disabled={actionId === s.storeId}
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
      </>
      )}
    </div>
  );
};

export default StoresAD;
