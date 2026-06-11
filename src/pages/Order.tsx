import React, { useState } from "react";
import TransactionModal from "../component/TransactionModal";
import useOrder from "../hooks/useOrder";
import api from "../utils/api";
import { toast } from "react-toastify";

const STATUS_FLOW: Record<string, string | null> = {
  pending: "processing",
  processing: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: "completed",
  completed: null,
  canceled: null,
  failed: null,
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  completed: "Completed",
  canceled: "Canceled",
  failed: "Failed",
};

const STATUS_NEXT_LABEL: Record<string, string> = {
  pending: "Mark preparing",
  processing: "Mark out for delivery",
  out_for_delivery: "Mark delivered",
  delivered: "Mark completed",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-600",
};

const STATUS_STEPS = ["pending", "processing", "out_for_delivery", "delivered", "completed"];

const Order: React.FC = () => {
  const {
    modalOpen, transactionDetails,
    expandedRows, toggleRow,
    handleViewReceipt, handleCloseModal, formatDate,
    mockOrderData, mockAllOrderData, mockDataOrder, loading, error,
  } = useOrder();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${STATUS_LABEL[newStatus]}`);
      // Reload to refresh data
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = (mockDataOrder as any[]).filter((order: any) => {
    const matchSearch = search === "" ||
      (order.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.orderNo || "").toLowerCase().includes(search.toLowerCase());
    const orderStatus = order.status || "pending";
    const matchStatus = statusFilter === "all" || orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="font-inter">
      {error && <p className="mx-2 mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="mx-2 mt-2 text-sm text-gray-500">Loading orders...</p>}

      {/* Stats */}
      <div className="flex flex-col sm:flex-row w-full justify-between py-2 gap-2 mb-2">
        {[
          { label: "Total Order Sale", value: mockOrderData.totalOrdersSale },
          { label: "Total Completed", value: mockOrderData.totalCompletedOrders },
          { label: "Total Pending", value: mockOrderData.totalPendingOrders },
          { label: "Total Failed", value: mockOrderData.totalFailedOrders },
        ].map((s, i) => (
          <div key={i} className="flex flex-col justify-between p-3 border bg-white border-gray-100 rounded-lg h-[70px] flex-1 mx-1">
            <span className="text-sm leading-4 text-gray-600">{s.label}</span>
            <span className="font-medium text-xl leading-7 text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search and filter */}
      <div className="mx-2 mb-3 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by customer or order no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:border-pry"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry"
        >
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Order table */}
      <div className="mt-1 mx-2 p-3 font-inter bg-white rounded-2xl">
        <div className="flex justify-between mb-3 items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">My Orders</h2>
            <span className="bg-pry rounded text-white px-2 text-xs">{mockAllOrderData.allOrder}</span>
          </div>
          <p className="text-xs text-gray-400">{filtered.length} showing</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b text-xs">
              <tr>
                <th className="py-3 px-2">Customer</th>
                <th className="px-2">Order No</th>
                <th className="px-2">Amount</th>
                <th className="px-2">Status</th>
                <th className="px-2">Payment</th>
                <th className="px-2">Date</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any, index: number) => {
                const status = order.status || "pending";
                const nextStatus = STATUS_FLOW[status];
                const orderId = order._id || order.orderNo;
                const isExpanded = expandedRows.includes(index);

                return (
                  <React.Fragment key={orderId || index}>
                    <tr
                      className={`border-b hover:bg-gray-50 cursor-pointer ${isExpanded ? "bg-orange-50" : ""}`}
                      onClick={() => toggleRow(index)}
                    >
                      <td className="py-3 px-2 font-medium">{order.name || "—"}</td>
                      <td className="px-2 font-mono text-xs">
                        {(order.orderNo || "").slice(0, 10).toUpperCase()}
                      </td>
                      <td className="px-2">
                        {typeof order.subTotal === "string"
                          ? order.subTotal
                          : `₦${Number(order.subTotal || 0).toLocaleString()}`}
                      </td>
                      <td className="px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[status] || "bg-gray-100 text-gray-500"}`}>
                          {STATUS_LABEL[status] || status}
                        </span>
                      </td>
                      <td className="px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td className="px-2 text-gray-400 text-xs">
                        <div>{order.orderDate ? formatDate(order.orderDate) : "—"}</div>
                        {order.orderTime && <div className="text-gray-300">{order.orderTime}</div>}
                      </td>
                      <td className="px-2">
                        <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          {nextStatus && status !== "completed" && (
                            <button
                              onClick={() => handleStatusUpdate(orderId, nextStatus)}
                              disabled={updatingId === orderId}
                              className="text-xs px-2 py-1 bg-pry text-white rounded font-medium whitespace-nowrap"
                            >
                              {updatingId === orderId ? "..." : STATUS_NEXT_LABEL[status]}
                            </button>
                          )}
                          <button
                            onClick={() => handleViewReceipt(order)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Progress tracker — expands on row click */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-orange-50 px-4 py-4 border-b">
                          {/* Progress steps */}
                          <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                            {STATUS_STEPS.map((step, si) => {
                              const currentIdx = STATUS_STEPS.indexOf(status);
                              const done = si <= currentIdx;
                              const isCurrent = si === currentIdx;
                              return (
                                <React.Fragment key={step}>
                                  <div className="flex flex-col items-center min-w-[70px]">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                      isCurrent ? "bg-pry text-white border-pry" :
                                      done ? "bg-pry text-white border-pry" :
                                      "bg-white border-gray-200 text-gray-300"
                                    }`}>
                                      {done ? "✓" : si + 1}
                                    </div>
                                    <span className={`mt-1 text-center text-xs whitespace-nowrap ${done ? "text-pry font-medium" : "text-gray-400"}`}>
                                      {STATUS_LABEL[step]}
                                    </span>
                                  </div>
                                  {si < STATUS_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mb-4 min-w-[16px] ${si < currentIdx ? "bg-pry" : "bg-gray-200"}`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Next action button inside expanded row */}
                          {nextStatus && (
                            <button
                              onClick={() => handleStatusUpdate(orderId, nextStatus)}
                              disabled={updatingId === orderId}
                              className="text-xs px-4 py-2 bg-pry text-white rounded-lg font-medium mt-1"
                            >
                              {updatingId === orderId ? "Updating..." : `→ ${STATUS_NEXT_LABEL[status]}`}
                            </button>
                          )}
                          {status === "completed" && (
                            <span className="text-xs text-green-600 font-medium">✓ Order completed</span>
                          )}

                          {/* Delivery address */}
                          {order.deliveryAddress && (
                            <p className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Deliver to: </span>
                              {order.deliveryAddress.address}, {order.deliveryAddress.lga}, {order.deliveryAddress.state}
                            </p>
                          )}

                          {/* Items summary */}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Items: </span>
                              {order.items.map((item: any, i: number) => (
                                <span key={i}>{item.itemName} ×{item.qty}{i < order.items.length - 1 ? ", " : ""}</span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <p className="text-center text-gray-400 py-8 text-sm">
              {search ? "No orders match your search." : "No orders yet."}
            </p>
          )}
        </div>
      </div>

      {modalOpen && transactionDetails && (
        <TransactionModal
          isOpen={modalOpen}
          transactionDetails={transactionDetails as any}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Order;
