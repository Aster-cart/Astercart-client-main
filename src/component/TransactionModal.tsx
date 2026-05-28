import React from "react";
import { tref } from "../assets/res";

interface TransactionDetails {
  orderNo: string;
  items: {
    itemName: string;
    qty: number;
    unitPrice: number; // Changed to number
  }[];
  subTotal: number;
  transactionReference: string;
  transactionStatus: string;
  storeId: string;
}

interface StoreDetails {
  storeName: string;
  lga: string;
  logo: string; // Assuming storeLogo is a URL to the logo image
}

const storeDetails: StoreDetails = {
  storeName: "Shoprite",
  lga: "Surulele",
  logo: "data:image/png;base64,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", // Placeholder logo
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionDetails: TransactionDetails;
}

const TransactionModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  transactionDetails,
}) => {
  if (!isOpen) return null;
  const handlePrintReceipt = () => {
    window.print();
  };
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }); // Format as HH:mm

  return (
    <div className="fixed font-inter inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white overflow-y-auto max-h-[96vh] rounded-lg p-6 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-[#F2F2F2] rounded-full w-8 h-8 flex justify-center items-center text-xl font-bold text-gray-700 hover:text-gray-900"
        >
          &times;
        </button>

        <h2 className="text-4xl font-semibold">Transaction Details</h2>

        <div className="mt-4  space-y-4">
          {storeDetails && (
            <div className="text-xs flex gap-2 items-end leading-6">
              <img
                src={storeDetails.logo}
                alt="Store Logo"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex gap-2 justify-end">
                <span className="font-semibold">{storeDetails.storeName}</span>
                <span className="font-semibold">{storeDetails.lga}</span>
              </div>
            </div>
          )}

          <div className="text-xs space-y-2 leading-6">
            <p className="font-normal text-black flex justify-between">
              <span>Order No:</span>
              <span className="font-semibold">
                {transactionDetails?.orderNo}
              </span>
            </p>

            <p className="font-normal text-black flex justify-between">
              <span>Transaction Reference:</span>
              <span className="flex font-semibold items-center">
                {transactionDetails?.transactionReference}
                <img src={tref} alt="Tref" className="ml-2 w-4 h-4" />
              </span>
            </p>

            {/* Multiple Items Display */}
            {transactionDetails?.items?.map((item, index) => (
              <div key={index} className="font-normal text-black">
                <div className="flex justify-between">
                  <p>Order:</p>
                  <span className="font-semibold">
                    {item.itemName} - {item.qty} Qty
                  </span>
                </div>
                <div className="flex justify-end">
                  <span className="font-semibold">
                    ₦{item.unitPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            <p className="font-normal text-black flex justify-between">
              <span>Sub Total:</span>
              <span className="font-semibold">
                {transactionDetails?.subTotal?.toLocaleString()}
              </span>
            </p>

            <p className="font-normal text-black flex gap-1">
              <span className="flex mr-[60%]">Date:</span>
              <span className="font-semibold">{formattedDate}</span>
              <span className="font-semibold">.</span> {/* Separator */}
              <span className="font-semibold">{formattedTime}</span>
            </p>

            <p className="font-normal text-black flex justify-between">
              <span>Status:</span>
              <span
                className={`px-2 rounded bg-opacity-30 ${
                  transactionDetails?.transactionStatus?.toLowerCase() ===
                  "successful"
                    ? "bg-[#155D18] text-[#155D18]"
                    : transactionDetails?.transactionStatus?.toLowerCase() ===
                      "unsuccessful"
                    ? "bg-red-500 text-red-500"
                    : "bg-gray-400 text-gray-500"
                }`}
              >
                {transactionDetails?.transactionStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handlePrintReceipt}
            className="bg-pry text-white py-2 w-[90%] rounded-lg font-semibold hover:bg-pry-dark"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
