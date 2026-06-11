import React from "react";
import { tref } from "../assets/res";

interface OrderItem {
  itemName: string;
  qty: number;
  unitPrice: number;
}

interface TransactionDetails {
  orderNo: string;
  orderDate?: string;
  orderTime?: string;
  items: OrderItem[];
  subTotal: number | string;
  transactionReference: string;
  transactionStatus: string;
  storeId?: string;
  storeName?: string;
  name?: string;
  deliveryAddress?: {
    address?: string;
    state?: string;
    lga?: string;
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionDetails: TransactionDetails;
}

const TransactionModal: React.FC<ModalProps> = ({ isOpen, onClose, transactionDetails }) => {
  if (!isOpen) return null;

  const handlePrint = () => window.print();

  // Use the order's actual date/time — NOT current time
  const orderDate = transactionDetails?.orderDate || "—";
  const orderTime = transactionDetails?.orderTime || "—";

  const storeName = transactionDetails?.storeName || "Store";

  const statusColor =
    transactionDetails?.transactionStatus?.toLowerCase() === "successful"
      ? "bg-green-100 text-green-700"
      : transactionDetails?.transactionStatus?.toLowerCase() === "unsuccessful"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="fixed font-inter inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white overflow-y-auto max-h-[96vh] rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-[#F2F2F2] rounded-full w-8 h-8 flex justify-center items-center text-xl font-bold text-gray-700 hover:text-gray-900"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4">Transaction Details</h2>

        <div className="space-y-4">
          {/* Store name — from order data, not hardcoded */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pry flex items-center justify-center text-white text-sm font-bold">
              {storeName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-sm">{storeName}</span>
          </div>

          <div className="text-xs space-y-3 leading-6">
            {/* Customer */}
            {transactionDetails?.name && (
              <p className="font-normal text-black flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold">{transactionDetails.name}</span>
              </p>
            )}

            {/* Order number */}
            <p className="font-normal text-black flex justify-between">
              <span>Order No:</span>
              <span className="font-semibold">{transactionDetails?.orderNo}</span>
            </p>

            {/* Transaction reference */}
            <p className="font-normal text-black flex justify-between">
              <span>Reference:</span>
              <span className="flex font-semibold items-center text-xs">
                {transactionDetails?.transactionReference?.slice(0, 16)}...
                <img src={tref} alt="" className="ml-2 w-4 h-4" />
              </span>
            </p>

            {/* Items */}
            {transactionDetails?.items?.map((item, i) => (
              <div key={i} className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">{item.itemName}</span>
                  <span className="font-semibold">{item.qty} × ₦{Number(item.unitPrice).toLocaleString()}</span>
                </div>
              </div>
            ))}

            {/* Subtotal */}
            <div className="border-t pt-2">
              <p className="font-normal text-black flex justify-between">
                <span>Sub Total:</span>
                <span className="font-semibold">
                  {typeof transactionDetails?.subTotal === "string"
                    ? transactionDetails.subTotal
                    : `₦${Number(transactionDetails?.subTotal || 0).toLocaleString()}`}
                </span>
              </p>
            </div>

            {/* Delivery address */}
            {transactionDetails?.deliveryAddress?.address && (
              <p className="font-normal text-black flex justify-between">
                <span>Deliver to:</span>
                <span className="font-semibold text-right max-w-[60%]">
                  {transactionDetails.deliveryAddress.address}, {transactionDetails.deliveryAddress.lga}
                </span>
              </p>
            )}

            {/* Date and time — from order data */}
            <p className="font-normal text-black flex justify-between">
              <span>Date placed:</span>
              <span className="font-semibold">{orderDate} {orderTime}</span>
            </p>

            {/* Status */}
            <p className="font-normal text-black flex justify-between">
              <span>Status:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                {transactionDetails?.transactionStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handlePrint}
            className="bg-pry text-white py-2 w-[90%] rounded-lg font-semibold"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
