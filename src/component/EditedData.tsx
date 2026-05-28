import React, { useEffect, useRef, useState } from "react";
import {
  dot,
} from "../assets/res";



/** Editable Table */

type InventoryItem = {
  sn: string;
  productId: string;
  productName: string;
  category: string;
  description: string;
  price: string | number;
  qty: string | number;
  supplier: string;
  discount: string;
  taxRate: string;
  image: string;
  [key: string]: string | number;
};


interface EditableTableProps {
  data: any[];
  onEdit: (index: number, key: string, value: any) => void;
  onDelete: (index: number) => void;
}

const EditedData: React.FC<EditableTableProps> = ({ data }) => {
  const [editedData, setEditedData] = useState<any>(data);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [, setShowModal] = useState(false);
  const [, setSelectedItem] = useState<InventoryItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Create a ref for the dropdown

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof InventoryItem,
    _index: number
  ) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]:
          field === "price" ||
          field === "qty" ||
          field === "discount" ||
          field === "taxRate"
            ? Number(e.target.value)
            : e.target.value,
      });
    }
  };

  // Save the changes when 'Save' button is clicked
  const handleSave = () => {
    if (editIndex !== null && editedData) {
      const updatedData = [...inventoryData];
      updatedData[editIndex] = { ...updatedData[editIndex], ...editedData }; // Save the edited data
      setInventoryData(updatedData);
      setEditIndex(null); // Exit edit mode
      setEditedData(null); // Reset edited data
      setDropdownIndex(null); // Close dropdown
    }
  };

  const handleDropdownToggle = (index: number) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditedData(inventoryData[index]);
    setDropdownIndex(null); // Close the dropdown
  };

  const handlePreviewClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([
    {
      sn: "1",
      productId: "P001",
      productName: "Wireless Mouse",
      category: "Electronics",
      description: "A wireless mouse with ergonomic design.",
      price: "20.0",
      qty: "2000",
      supplier: "TechCo",
      discount: "8",
      taxRate: "218.0",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxSoL46b6lEz1Jxfct2detddeQc7DTafm9Kg&s",
    },
    {
      sn: "2",
      productId: "P002",
      productName: "Laptop Stand",
      category: "Accessories",
      description: "Adjustable laptop stand for ergonomic comfort.",
      price: "235.0",
      qty: "2000",
      supplier: "OfficeWorks",
      discount: "10",
      taxRate: "230.0",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl7YI9xc5yR9mN_3VM_7-AoP1jsVVOTquO_w&s",
    },
    {
      sn: "3",
      productId: "P003",
      productName: "Bluetooth Speaker",
      category: "Electronics",
      description: "Portable Bluetooth speaker with high bass sound.",
      price: "250.0",
      qty: "2000",
      supplier: "SoundMax",
      discount: "5",
      taxRate: "245.0",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM4mM5rj4uaM-kW2BO8Xo-xDQpBtFOj4uXmQ&s",
    },
    {
      sn: "4",
      productId: "P004",
      productName: "USB-C Cable",
      category: "Accessories",
      description: "Durable USB-C cable for fast charging and data transfer.",
      price: "210.0",
      qty: "2000",
      supplier: "CableTech",
      discount: "12",
      taxRate: "28.5",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsxWgT9FNxaXwgHqoyv11NWxhlakziaGetgA&s",
    },
    {
      sn: "5",
      productId: "P005",
      productName: "LED Desk Lamp",
      category: "Home & Office",
      description: "Energy-efficient LED desk lamp with adjustable brightness.",
      price: "240.0",
      qty: "2000",
      supplier: "BrightLite",
      discount: "7",
      taxRate: "235.0",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBInMaRaIYtmM4HM6OJZp-2YWeDyJQtioJtA&s",
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownIndex(null); // Close dropdown when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <table className="min-w-full font-inter table-auto">
      <thead>
        <tr>
          <th className="px-4 py-2">SN</th>
          <th className="px-4 py-2">Product ID</th>
          <th className="px-4 py-2">Product Name</th>
          <th className="px-4 py-2">Category</th>
          <th className="px-4 py-2">Description</th>
          <th className="px-4 py-2">Price</th>
          <th className="px-4 py-2">Qty</th>
          <th className="px-4 py-2">Discount</th>
          <th className="px-4 py-2">Tax Rate</th>
        </tr>
      </thead>
      <tbody>
        {inventoryData.map((item, index) => (
          <tr key={index}>
            <td className="border-b text-xs gap-2 leading-4 font-normal text-[#434343] border-gray-300">
              {item.sn}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="text"
                  value={editedData?.productId || ""}
                  onChange={(e) => handleInputChange(e, "productId", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.productId} // Show old text
                />
              ) : (
                item.productId
              )}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="text"
                  value={editedData?.productName || ""}
                  onChange={(e) => handleInputChange(e, "productName", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.productName}
                />
              ) : (
                item.productName
              )}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="text"
                  value={editedData?.category || ""}
                  onChange={(e) => handleInputChange(e, "category", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.category}
                />
              ) : (
                item.category
              )}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="text"
                  value={editedData?.description || ""}
                  onChange={(e) => handleInputChange(e, "description", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.description}
                />
              ) : (
                item.description
              )}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="number"
                  value={
                    editedData?.price !== undefined
                      ? editedData.price.toString()
                      : ""
                  }
                  onChange={(e) => handleInputChange(e, "price", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.price.toString()}
                />
              ) : (
                item.price
              )}
            </td>

            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="number"
                  value={editedData?.qty || ""}
                  onChange={(e) => handleInputChange(e, "qty", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.toString()}
                />
              ) : (
                item.qty
              )}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="text"
                  value={editedData?.discount || ""}
                  onChange={(e) => handleInputChange(e, "discount", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.discount.toString()}
                />
              ) : (
                item.discount
              )}
            </td>
            <td className="px-2 py-3">
              {editIndex === index ? (
                <input
                  type="text"
                  value={editedData?.taxRate || ""}
                  onChange={(e) => handleInputChange(e, "taxRate", index)}
                  className="w-full border p-3 border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
                  placeholder={item.taxRate.toString()}
                />
              ) : (
                item.taxRate
              )}
            </td>
            {/* Repeat similar structure for other columns */}
            <td className="px-2 py-3 relative">
              <img
                src={dot}
                alt="Dot"
                className="cursor-pointer"
                onClick={() => handleDropdownToggle(index)}
              />
              {dropdownIndex === index && (
                <div
                  ref={dropdownRef}
                  className="absolute bg-white border right-10 border-gray-300 rounded-md mt-2 w-[150px] shadow-lg"
                >
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={() => handleEditClick(index)}
                        className="w-full hover:bg-[#FFF6F0] rounded text-sm text-left py-2 px-4"
                      >
                        Edit Product
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handlePreviewClick(item)}
                        className="w-full hover:bg-[#FFF6F0] rounded text-sm text-left py-2 px-4"
                      >
                        Preview
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </td>
            {editIndex === index && (
              <td className="px-2 py-3">
                <button
                  onClick={() => handleSave()}
                  className="bg-pry text-white px-2 py-1 rounded"
                >
                  Save
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};


export default EditedData