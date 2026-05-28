import React, { useEffect, useRef, useState } from "react";
import {
  deleteIcon,
  dot,
  edit,
  preview,
  product,
  search,
} from "../assets/res";
import ProductForm from "../component/ProductForm";
import ImportModal from "../component/ImportModal";
import EditedData from "../component/EditedData";
import { useProductStore } from "../store/productStore";
import { InventoryItem, Product } from "../types/product.types";

type EditedData = Partial<InventoryItem>;

const Inventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<Product[]|null>([]);
  // const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const handleOpenProductForm = () => setShowProductForm(true);
  const handleOpenImportModal = () => setShowImportModal(true);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null); // Tracks which dropdown is open
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null); // Index of the editing row
  const [editedData, setEditedData] = useState<EditedData>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [selectedFilter, setSelectedFilter] = useState<string>("All Products");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { products, fetchProducts, updateProduct, deleteProduct } = useProductStore();


  const filteredInventory = inventoryItems?.length!==0? inventoryItems?.filter((inventoryItems) => {
    const isNumeric = !isNaN(Number(inventoryItems.qty)); // Check if qty is a numeric string
    const qtyValue = isNumeric ? Number(inventoryItems.qty) : null; // Convert to number if numeric
    // Apply filter logic
    const matchesFilter =
      selectedFilter === "All Products" ||
      (selectedFilter === "Low Stock Products" &&
        qtyValue !== null &&
        qtyValue < 10);

    // Apply search logic (global across all fields)
    const matchesSearchQuery =
      searchQuery === "" ||
      Object.values(inventoryItems)
        .join(" ") // Combine all fields into a single string
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Return items that match both filter and search
    return matchesFilter && matchesSearchQuery;
  }): [];
  const formatWithCommas = (value: string | number): string => {
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return value.toString(); // Return as-is if not a valid number
    return new Intl.NumberFormat("en-US").format(number);
  };


  useEffect(() => {
    // Set inventory data on mount
    fetchProducts(); // Fetch products on mount
    // setInventoryItems(products);    
    // setInventoryData(products);
  }, []);
  useEffect(() => {
    // Set inventory data on mount
    // fetchProducts(); // Fetch products on mount
    setInventoryItems(products);    
    // setInventoryData(products);
  }, [products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleImport = (importedData: any[]) =>{
     setInventoryItems((prev) => [...(prev||[]), ...importedData]);
  }

  const handleAddProduct = (product: any) =>
    setInventoryItems((prev) => [...(prev||[]), product]);

  const mockTotalInventoryData = {
    totalStockItems: 500,
    totalSoldItems: 300,
    totalItemsOutofStock: 150,
  };
  const mockAllInventorytData = {
    allInventory: products?products.reduce((total,current)=>total+Number(current.quantity),0):0, // Mock number of transactions
  };

  const handleDropdownToggle = (index: number) => {
    // Toggle the dropdown visibility
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleEditClick = (index: number): void => {
    setEditIndex(index);
    if (inventoryItems === null) return; // Guard clause to handle null case
    setEditedData({ ...inventoryItems[index] }); // Clone the current item
  };

  const handlePreviewClick = (item: InventoryItem) => {
    setSelectedItem(item); // Correctly set the item for preview
    setShowModal(true); // Show the modal
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (editIndex === null || !inventoryItems) return;
    const item = inventoryItems[editIndex] as Product & { _id?: string };
    const id = item._id || item.productId;
    if (!id) return;
    try {
      await updateProduct(id, {
        name: editedData.name || item.name,
        description: editedData.description || item.description,
        category: editedData.category || item.category,
        price: Number(editedData.price ?? item.price),
        quantity: Number(editedData.qty ?? item.quantity),
        discount: Number(editedData.discount ?? item.discount),
        taxRate: Number(editedData.taxRate ?? item.taxRate),
      });
      setEditIndex(null);
      setEditedData({});
      fetchProducts();
    } catch {
      window.alert("Could not save product. Try again.");
    }
  };

  const handleInputChange = (
    field: keyof InventoryItem,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (itemsn: string | number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const item = inventoryItems?.find((i) => i.sn === itemsn) as Product & { _id?: string };
    const id = item?._id || item?.productId;
    if (!id) return;
    try {
      await deleteProduct(String(id));
      fetchProducts();
    } catch {
      window.alert("Could not delete product.");
    }
  };
  
  
  
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownIndex(null); // Close dropdown
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto font-inter  h-[calc(100%-60px)] flex flex-col flex-grow overflow-hidden  pb-4 ">
      {inventoryItems?.length === 0||!inventoryItems ||<div className="flex w-full py-3">
        <div className="flex flex-col border bg-white border-fade h-[70px] rounded-lg justify-between p-3 mx-1 w-1/3">
          <span className="text-sm leading-4">Total Stock Items</span>
          <span className="font-medium text-xl leading-7">
            {mockTotalInventoryData.totalStockItems}
          </span>
        </div>
        <div className="flex flex-col bg-white border-fade rounded-lg h-[70px] border justify-between p-3 mx-1 w-1/3">
          <span className="text-sm leading-4">Total Sold Items</span>
          <span className="font-medium text-xl leading-7">
            {mockTotalInventoryData.totalSoldItems}
          </span>
        </div>
        <div className="flex flex-col bg-white border-fade rounded-lg h-[70px] border justify-between p-3 mx-1 w-1/3">
          <span className="text-sm leading-4">Total Items Out of Stock</span>
          <span className="font-medium text-xl leading-7">
            {mockTotalInventoryData.totalItemsOutofStock}
          </span>
        </div>
      </div>}
      <div className="flex  w-full h-full overflow-scroll">
        {showProductForm ? (
          <div className="w-full ">
            <ProductForm
              onClose={() => setShowProductForm(false)}
              onAdd={handleAddProduct}
            />
          </div>
        ) : inventoryItems?.length === 0||!inventoryItems ? (
          <div className="flex flex-col mx-auto items-center justify-center w-full">
            <img
              src={product}
              alt="Empty Inventory"
              className="w-32 h-32 mb-2"
            />
            <p className="text-2xl font-medium mb-2">Inventory is Empty</p>
            <p className="text-sm text-gray-500 mb-4 text-left">
              You don’t have any items in your inventory.
              <br />
              Import items or add them yourself.
            </p>

            <div className="relative group ">
              <button className="bg-black text-white px-4 py-2 rounded">
                Import Inventory
              </button>

              {/* Dropdown Menu */}
              <div className="absolute hidden group-focus-within:block bg-white border border-gray-300 rounded-md mt-2 w-[300px] shadow-lg z-10 left-1/2 transform -translate-x-1/2 overflow-visible">
                <ul className="py-2">
                  <li>
                    <button
                      onClick={handleOpenImportModal}
                      className="px-4 text-sm leading-4 py-2 rounded w-full text-left"
                    >
                      Import CSV File
                    </button>
                  </li>
                  <li className="">
                    <button
                      onClick={handleOpenProductForm}
                      className="px-4 text-sm leading-4 py-2 rounded w-full text-left"
                    >
                      Create Product From Scratch
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex w-full rounded-2xl p-2 pr-5 mx-2 bg-white flex-col">
              <div className="flex justify-between mb-4">
                <div className="flex w-[20%] text-center justify-between items-center ">
                  <h2 className="text-base leading-6 pr-2 font-semibold">
                    All Products
                  </h2>
                  <span className="bg-pry rounded text-white px-2  ">
                    {mockAllInventorytData.allInventory}
                  </span>
                </div>
                <div className="flex justify-between w-[70%]">
                  {/* Search Bar */}
                  <div className="w-[50%] relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <img src={search} alt="search icon" className="w-4 h-4" />
                    </div>
                    <input
                      type="search"
                      placeholder="Search ..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full px-10 py-2 border rounded-lg text-gray-400 font-medium text-xs sm:text-sm border-gray-300 focus:outline-none focus:ring-0"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="">
                    {/* Dropdown Button */}
                    <button
                      className="bg-bginput text-[#434343] rounded-md px-2 py-2 flex items-center space-x-2"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span>{selectedFilter}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute bg-white border border-gray-300 rounded-md mt-2 w-[200px] shadow-lg">
                        <ul className="py-2">
                          <li
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-fade hover:mx-2 hover:rounded-lg"
                            onClick={() => {
                              setSelectedFilter("All Products");
                              setIsOpen(false);
                            }}
                          >
                            All Products
                          </li>
                          <li
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-fade hover:mx-2 hover:rounded-lg"
                            onClick={() => {
                              setSelectedFilter("Low Stock Products");
                              setIsOpen(false);
                            }}
                          >
                            Low Stock Products
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Apply Filter Button */}

                  <div className="relative group">
                    <button className="bg-black text-white px-4 py-2 rounded">
                      Import Inventory
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute hidden group-focus-within:block bg-white border border-gray-300 rounded-md mt-2 w-[300px] shadow-lg z-10 left-1/2 transform -translate-x-1/2 overflow-visible">
                      <ul className="py-2">
                        <li>
                          <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 text-sm leading-4 py-2 rounded w-full text-left"
                          >
                            Import CSV File
                          </button>
                        </li>
                        <li className="">
                          <button
                            onClick={() => setShowProductForm(true)}
                            className="px-4 text-sm leading-4 py-2 rounded w-full text-left"
                          >
                            Create Product From Scratch
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide ">
                <table className="w-full table-auto border-collapse">
                  <thead className="text-xs text-[#7B7B7B] text-left border-b py-3 gap-2 leading-4 !font-normal">
                    <tr>
                      <th className="px-2 py-3">S/N</th>
                      <th className="px-2 py-3">Product ID</th>
                      <th className="px-2 py-3">Product Name</th>
                      <th className="px-2 py-3">Category</th>
                      <th className="px-2 py-3">Description</th>
                      <th className="px-2 py-3">Price</th>
                      <th className="px-2 py-3">Qty</th>
                      <th className="px-2 py-3">Discount</th>
                      <th className="px-2 py-3">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-xs">
                    {filteredInventory?.map((item, index) => (
                      <tr key={index}>
                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal  border-gray-300">
                          {index + 1}
                        </td>

                        <td className="border-b text-xs gap-2 leading-4 font-normal  border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editedData.productId || ""}
                              onChange={(e) =>
                                handleInputChange("productId", e)
                              }
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.productId}
                            />
                          ) : (
                            item.productId
                          )}
                        </td>

                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal  border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editedData.productName || ""}
                              onChange={(e) =>
                                handleInputChange("productName", e)
                              }
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.name}
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal  border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editedData.category || ""}
                              onChange={(e) => handleInputChange("category", e)}
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.category}
                            />
                          ) : (
                            item.category
                          )}
                        </td>
                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal  border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editedData.description || ""}
                              onChange={(e) =>
                                handleInputChange("description", e)
                              }
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.description}
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="number"
                              value={
                                editedData.price !== undefined
                                  ? editedData.price.toString()
                                  : ""
                              }
                              onChange={(e) => handleInputChange("price", e)}
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.price.toString()}
                            />
                          ) : (
                            formatWithCommas(item.price)
                          )}
                        </td>

                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="number"
                              value={editedData.qty || ""}
                              onChange={(e) => handleInputChange("qty", e)}
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.qty.toString()}
                            />
                          ) : (
                            formatWithCommas(item.quantity)
                          )}
                        </td>

                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal  border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editedData.discount || ""}
                              onChange={(e) => handleInputChange("discount", e)}
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.discount.toString()}
                            />
                          ) : (
                            `${item.discount}%`
                          )}
                        </td>
                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal border-gray-300">
                          {editIndex === index ? (
                            <input
                              type="text"
                              value={editedData.taxRate || ""}
                              onChange={(e) => handleInputChange("taxRate", e)}
                              className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-orange-500"
                              placeholder={item.taxRate.toString()}
                            />
                          ) : (
                            `${item.taxRate}%` // Append the percentage sign here
                          )}
                        </td>

                        {/* Repeat similar structure for other columns */}
                        <td className="border-b px-2 py-3 text-xs gap-2 leading-4 font-normal  border-gray-300relative">
                          {editIndex === index ? (
                            <button
                              onClick={handleSaveEdit} // Handle save when clicked
                              className="bg-pry text-white px-2 py-1 rounded"
                            >
                              Save
                            </button>
                          ) : (
                            <div className="relative">
                              <img
                                src={dot} // Dot image for dropdown toggle
                                alt="Dot"
                                className="cursor-pointer"
                                onClick={() => handleDropdownToggle(index)} // Show dropdown menu on click
                              />
                              {dropdownIndex === index && (
                                <div
                                  ref={dropdownRef}
                                  className="absolute bg-white border top-0 right-10 border-gray-300 rounded-md mt-2 w-[150px] shadow-lg"
                                >
                                  <ul className="py-2">
                                    <li>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleEditClick(index);
                                          setDropdownIndex(null); // Close dropdown
                                        }}
                                        className=" w-full gap-8 flex text-left p-2 hover:bg-[#FFF6F0] rounded"
                                      >
                                        <img src={edit} alt="" />
                                        Edit Product
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default button behavior
                                        handleDelete(item.sn); // Pass the specific item's ID to handleDelete
                                        setDropdownIndex(null); // Close the dropdown after deleting
                                      }}
                                        className=" w-full gap-8 flex text-left p-2 hover:bg-[#FFF6F0] rounded"
                                      >
                                        <img src={deleteIcon} alt="" />
                                        Delete
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => handlePreviewClick(item)} // Preview the item when clicked
                                        className=" w-full gap-8 flex text-left p-2 hover:bg-[#FFF6F0] rounded"
                                      >
                                        <img src={preview} alt="" />
                                        Preview
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {showModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg h-[50%] mt-10  p-2 w-[100%] max-w-lg relative">
                        <button
                          onClick={handleCloseModal}
                          className="absolute top-3 right-3 border-[#DCE4E8] "
                        >
                          &times;
                        </button>
                        <p className="leading-9 text-lg">Preview</p>
                        <div className="flex border-b justify-between mb-2">
                          <div className="border-r w-1/2 pr-3 text-xs leading-6">
                            <div className="justify-between flex">
                              <p className="text-[#6C7278]  leading-6 mb-2">
                                Product Name
                              </p>
                              <p className=" font-semibold text-right">
                                {selectedItem.name}
                              </p>
                            </div>
                            <div className="justify-between flex">
                              <p className="text-[#6C7278]  leading-6 mb-2">
                                {" "}
                                Product ID
                              </p>
                              <p className=" font-semibold text-right">
                                {selectedItem.productId}
                              </p>
                            </div>
                            <div className="justify-between flex">
                              <p className="text-[#6C7278]  leading-6 mb-2">
                                Category
                              </p>
                              <p className=" font-semibold text-right">
                                {selectedItem.category}
                              </p>
                            </div>
                            <div className="justify-between flex">
                              <p className="text-[#6C7278]  leading-6 mb-2">
                                Quantity
                              </p>
                              <p className=" font-semibold text-right">
                                {selectedItem.qty}
                              </p>
                            </div>
                          </div>
                          <div className=" w-1/2 pl-3 h-full text-xs leading-6">
                            <p className="font-semibold">Product Image/Price</p>
                            <div className="justify-between h-[10%] my-auto border mb-5 rounded-lg mt-4 flex p-4">
                              <img
                                src={selectedItem.image}
                                alt={selectedItem.name}
                                className="h-14 w-14 object-cover mb-2 rounded-lg"
                              />
                              <p className="my-auto ">{selectedItem.price}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleCloseModal}
                          className="bg-pry text-white px-4 py-2 rounded absolute right-4 bottom-4"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onImport={handleImport}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
