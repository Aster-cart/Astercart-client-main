import React, { useState } from "react";
import { preview, print, receipt } from "../assets/res";
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
  pending: "Mark as preparing",
  processing: "Mark as out for delivery",
  out_for_delivery: "Mark as delivered",
  delivered: "Mark as completed",
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

const Order: React.FC = () => {
  const {
    activeDropdown, modalOpen, transactionDetails,
    dropdownRef, toggleDropdown, handleViewReceipt,
    handleCloseModal, toggleRow, calculateSubtotal, formatDate,
    mockOrderData, mockAllOrderData, mockDataOrder, loading, error,
  } = useOrder();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/store/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${STATUS_LABEL[newStatus]}`);
      window.location.reload();
    } catch {
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {error && <p className="mx-2 mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="mx-2 mt-2 text-sm text-gray-500">Loading orders...</p>}

      {/* Stats */}
      <div className="flex flex-col font-inter mr-2 sm:flex-row w-full justify-between py-2">
        {[
          { label: "Total Order Sale", value: mockOrderData.totalOrdersSale },
          { label: "Total Completed", value: mockOrderData.totalCompletedOrders },
          { label: "Total Pending", value: mockOrderData.totalPendingOrders },
          { label: "Total Failed", value: mockOrderData.totalFailedOrders },
        ].map((s, i) => (
          <div key={i} className="flex flex-col justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
            <span className="text-sm leading-4 text-gray-600">{s.label}</span>
            <span className="font-medium text-xl leading-7 text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Order table */}
      <div className="mt-1 mx-2 p-2 py-3 font-inter bg-white rounded-2xl">
        <div className="flex justify-between mb-2">
          <div className="flex w-[20%] text-center justify-between items-center">
            <h2 className="text-base leading-6 pr-2 font-semibold">My Orders</h2>
            <span className="bg-pry rounded text-white px-2">{mockAllOrderData.allOrder}</span>
          </div>
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
                <th className="px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {(mockDataOrder as any[]).map((order: any, index: number) => {
                const status = order.transactionStatus || order.status || "pending";
                const nextStatus = STATUS_FLOW[status];
                const orderId = order._id || order.orderNo;

                return (
                  <React.Fragment key={orderId || index}>
                    <tr
                      className="border-b hover:bg-gray-50 cursor-pointer"
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
                        {order.orderDate ? formatDate(order.orderDate) : "—"}
                        {order.orderTime ? <span className="block">{order.orderTime}</span> : null}
                      </td>
                      <td className="px-2">
                        <div className="flex gap-1 flex-wrap">
                          {nextStatus && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(orderId, nextStatus); }}
                              disabled={updatingId === orderId}
                              className="text-xs px-2 py-1 bg-pry text-white rounded font-medium whitespace-nowrap"
                            >
                              {updatingId === orderId ? "..." : STATUS_NEXT_LABEL[status]}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewReceipt(order); }}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/* Progress tracker — expands on row click */}
                  {expandedRows.includes(index) && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-4 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {["pending","processing","out_for_delivery","delivered","completed"].map((step, si) => {
                            const statusOrder = ["pending","processing","out_for_delivery","delivered","completed"];
                            const currentIdx = statusOrder.indexOf(order.status || order.transactionStatus?.toLowerCase() || "pending");
                            const stepIdx = si;
                            const done = stepIdx <= currentIdx;
                            const isCurrent = stepIdx === currentIdx;
                            return (
                              <React.Fragment key={step}>
                                <div className={`flex flex-col items-center text-xs ${done ? "text-pry" : "text-gray-300"}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 ${isCurrent ? "bg-pry text-white border-pry" : done ? "bg-pry text-white border-pry" : "bg-white border-gray-200 text-gray-300"}`}>
                                    {done ? "✓" : si + 1}
                                  </div>
                                  <span className="mt-1 text-center whitespace-nowrap">{STATUS_LABEL[step]}</span>
                                </div>
                                {si < 4 && <div className={`flex-1 h-0.5 ${stepIdx < currentIdx ? "bg-pry" : "bg-gray-200"}`} />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        {/* Delivery address */}
                        {order.deliveryAddress && (
                          <div className="mt-3 text-xs text-gray-500">
                            <span className="font-medium">Deliver to: </span>
                            {order.deliveryAddress.address}, {order.deliveryAddress.lga}, {order.deliveryAddress.state}
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
          {mockDataOrder.length === 0 && !loading && (
            <p className="text-center text-gray-400 py-8 text-sm">No orders yet.</p>
          )}
        </div>
      </div>

      {modalOpen && transactionDetails && (
        <TransactionModal
          isOpen={modalOpen}
          transactionDetails={transactionDetails}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Order;
