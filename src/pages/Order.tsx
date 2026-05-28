import React from "react";
import { dot, preview, print, receipt } from "../assets/res";
import TransactionModal from "../component/TransactionModal";
import useOrder from "../hooks/useOrder";


const Order: React.FC = () => {
   const {
    activeDropdown,
    modalOpen,
    transactionDetails,
    selectedItem,
    showPreview,
    expandedRows,
    dropdownRef,
    toggleDropdown,
    handleViewReceipt,
    handlePrintReceipt,
    handleCloseModal,
    handlePreviewClick,
    handleClosePreview,
    toggleRow,
    calculateSubtotal,
    formatDate,
    formattedDate,
    formattedTime,
    mockOrderData,
    mockAllOrderData,
    mockDataOrder,
    loading,
    error,
    } = useOrder();
    
  return (
    <div>
      {error && (
        <p className="mx-2 mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
      {loading && (
        <p className="mx-2 mt-2 text-sm text-gray-500">Loading orders...</p>
      )}
      {/* Dashboard Stats */}
      <div className="flex flex-col font-inter mr-2 sm:flex-row w-full justify-between py-2">
        {/* Total Orders Card */}
        <div className="flex flex-col  justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
          <span className="text-sm leading-4 text-gray-600">
            Total Order Sale
          </span>
          <span className="font-medium text-xl leading-7 text-gray-900">
            {mockOrderData.totalOrdersSale}
          </span>
        </div>
        <div className="flex flex-col  justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
          <span className="text-sm leading-4 ">Total Completed Order</span>
          <span className="font-medium text-xl leading-7 text-gray-900">
            {mockOrderData.totalCompletedOrders}
          </span>
        </div>
        <div className="flex flex-col  justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
          <span className="text-sm leading-4 ">Total Pending Order</span>
          <span className="font-medium text-xl leading-7 text-gray-900">
            {mockOrderData.totalPendingOrders}
          </span>
        </div>
        <div className="flex flex-col  justify-between p-3 border bg-white border-fade rounded-lg h-[70px] w-[432px] mx-1">
          <span className="text-sm leading-4 ">Total Failed Order</span>
          <span className="font-medium text-xl leading-7 text-gray-900">
            {mockOrderData.totalFailedOrders}
          </span>
        </div>
      </div>
      {/* Transaction Table Section */}
      <div className="mt-1 mx-2 p-2 py-3 font-inter bg-white rounded-2xl">
        <div className="flex justify-between mb-2">
          <div className="flex w-[20%] text-center justify-between items-center">
            <h2 className="text-base leading-6 pr-2 font-semibold">My Order</h2>
            <span className="bg-pry rounded text-white px-2">
              {mockAllOrderData.allOrder}
            </span>
          </div>
        </div>
        <table className="w-full text-left table-auto border-collapse">
          <thead className="text-xs text-left text-[#7B7B7B] border-b  gap-2 leading-4 font-normal">
            <tr className="w-full">
              <th className="px-2 w-[10%] ">Name</th>
              <th className="px-2 py-3 w-[10%]">Order Date</th>
              <th className="px-2 py-3 w-[7%]">Order No</th>
              <th className="px-4 w-[22%] py-3">Item</th> {/* Fixed width */}
              <th className="px-2 py-3 w-[3%]">Qty</th> {/* Fixed width */}
              <th className="px-2 py-3 w-[7%]">Unit Price</th>{" "}
              {/* Fixed width */}
              <th className="px-2 py-3 W-[7%]">Sub Total</th>
              <th className="px-2 py-3 W-[14%]">Transaction Reference</th>
              <th className="px-2 py-3 W-[12%]">Transaction Status</th>
            </tr>
          </thead>
          <tbody>
            {mockDataOrder.map((order, index) => (
              <tr
                key={`${order.transactionReference}-${index}`}
                className="border-b text-xs w-full leading-4 font-normal "
              >
                {/* Main Order Data */}
                <td className="px-2 py-3 w-[10%]  ">{order.name}</td>
                <td className="px-2 py-3 w-[10%]">
                  <div>{formatDate(order.orderDate)}</div>
                  <div>{order.orderTime}</div>
                </td>{" "}
                <td className="px-2 py-3 w-[10%]">{order.orderNo}</td>
                {/* Items with Toggle */}
                <td className="px-2  w-[34%] " colSpan={3}>
                  <div className="flex gap-2 w-full ">
                    {/* Item Name with Toggle Button */}
                    <div className="flex gap-2 justify-between pr-3  w-[66%]  ">
                      <span className="truncate px-2 py-3">
                        {order.items[0].itemName}
                      </span>
                      {order.items.length > 1 && (
                        <button
                          className="text-pry"
                          onClick={() => toggleRow(index)}
                        >
                          {expandedRows.includes(index) ? "Less" : "More"}
                        </button>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="w-[12%] px-2 py-3 selection: ">
                      {order.items[0].qty}
                    </div>

                    {/* Unit Price */}
                    <div className="w-[22%] px-2 py-3  ">
                      {order.items[0].unitPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Toggleable Additional Items */}
                  {expandedRows.includes(index) &&
                    order.items.slice(1).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex mt-2">
                        <div className="w-[66%]  px-2 py-3  ">
                          {item.itemName}
                        </div>
                        <div className="w-[12%] px-2  py-3   ">{item.qty}</div>
                        <div className="w-[22%] px-2  py-3   ">
                          {item.unitPrice.toLocaleString()}
                        </div>
                      </div>
                    ))}
                </td>
                {/* Subtotal */}
                <td className="px-2 py-3 w-[7%] ">
                  {calculateSubtotal(order.items).toLocaleString()}
                </td>
                <td className="px-2 w-[15%] py-3">
                  {order.transactionReference}
                </td>
                <td className="py-3 px-2 flex w-full justify-between items-center relative">
                  <span
                    className={`pr-3 p-2 rounded ${
                      order.transactionStatus.toLowerCase() === "successful"
                        ? "bg-[#155D18] bg-opacity-30 text-[#155D18]"
                        : order.transactionStatus.toLowerCase() ===
                          "unsuccessful"
                        ? "bg-red-500 bg-opacity-30 text-red-500"
                        : "bg-gray-400 bg-opacity-30 text-gray-500"
                    }`}
                  >
                    {order.transactionStatus}
                  </span>

                  <img
                    src={dot}
                    alt="Dot"
                    className="cursor-pointer"
                    onClick={() => toggleDropdown(index)}
                  />

                  {/* Dropdown */}
                  {activeDropdown === index && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-8 right-0 justify-between bg-white shadow-lg rounded-lg p-4 z-10 w-[200px]"
                    >
                      <button
                        className="w-full gap-8 flex text-left py-2 hover:bg-[#FFF6F0] rounded"
                        onClick={() => handleViewReceipt(order)}
                      >
                        <img src={receipt} alt="" />
                        View Receipt
                      </button>

                      <button
                        className="w-full gap-8 flex text-left py-2 hover:bg-[#FFF6F0] rounded"
                        onClick={handlePrintReceipt}
                      >
                        <img src={print} alt="" />
                        Print Receipt
                      </button>
                      <button
                        className="w-full gap-8 flex text-left py-2 hover:bg-[#FFF6F0] rounded"
                        onClick={() => handlePreviewClick(order)}
                      >
                        <img src={preview} alt="" />
                        Preview
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {showPreview && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg h-[50%] mt-10 p-2 w-[100%] max-w-lg relative">
                <button
                  onClick={handleClosePreview}
                  className="absolute top-3 right-3 border-[#DCE4E8]"
                >
                  &times;
                </button>
                <p className="leading-9 text-lg">Preview</p>
                <div className="flex border-b justify-between mb-2">
                  <div className="border-r w-1/2 pr-3 text-xs leading-6">
                    {/* Order No */}
                    <div className="justify-between flex">
                      <p className="text-[#6C7278] leading-6 mb-2">Order No</p>
                      <p className="font-semibold text-right">
                        {selectedItem.orderNo}
                      </p>
                    </div>

                    {/* Transaction Reference */}
                    <div className="justify-between flex">
                      <p className="text-[#6C7278] leading-6 mb-2">
                        Transaction Reference
                      </p>
                      <p className="font-semibold text-right">
                        {selectedItem.transactionReference}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="justify-between flex">
                      <p className="text-[#6C7278] leading-6 mb-2">Quantity</p>
                      <p className="font-semibold text-right">
                        {selectedItem.items[0].qty}
                      </p>
                    </div>

                    {/* Date and Time */}
                    <div className="justify-between flex">
                      <span className="flex text-[#6C7278]">Date:</span>
                      <p className="font-normal text-black flex gap-1">
                        <span className="font-semibold">{formattedDate}</span>
                        <span className="font-semibold">.</span>
                        <span className="font-semibold">{formattedTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* Product Image and Price */}
                  <div className="w-1/2 pl-3 h-full text-xs leading-6">
                    <p className="font-semibold flex justify-between w-full">
                      Order
                      <span className="ml-auto">
                        ({selectedItem.items.length} item
                        {selectedItem.items.length > 1 ? "s" : ""})
                      </span>
                    </p>

                    {/* Product Image and Price */}
                    <div className="justify-between h-[5%] my-auto border mb-2 rounded-lg mt-2 flex p-2">
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.orderNo}
                        className="h-14 w-14 object-cover mb-2 rounded-lg"
                      />
                      <p className="my-auto">
                        ₦{selectedItem.items[0].unitPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Repeat Image and Price for Other Items if Necessary */}
                    {selectedItem.items.slice(1).map((item, index) => (
                      <div
                        key={index}
                        className="justify-between h-[5%] my-auto border mb-3 rounded-lg flex p-2"
                      >
                        <img
                          src={selectedItem.image}
                          alt={item.itemName}
                          className="h-14 w-14 object-cover mb-2 rounded-lg"
                        />
                        <p className="my-auto">
                          ₦{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </table>
      </div>
      {/* Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        transactionDetails={transactionDetails}
      />
    </div>
  );
};

export default Order;
