import React, { useEffect, useRef, useState } from "react";
import { deleteIcon, dot, edit, search } from "../assets/res";
import ProductForm from "../component/ProductForm";
import ImportModal from "../component/ImportModal";
import EditProductModal from "../component/EditProductModal";
import { useProductStore } from "../store/productStore";
import { Product } from "../types/product.types";

const Inventory: React.FC = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { products, fetchProducts, deleteProduct } = useProductStore();

  useEffect(() => { fetchProducts(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatWithCommas = (value: string | number): string => {
    const n = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(n)) return String(value);
    return new Intl.NumberFormat("en-NG").format(n);
  };

  const filteredProducts = (products || []).filter((item) => {
    const qty = Number(item.quantity ?? item.qty ?? 0);
    const matchesFilter =
      selectedFilter === "All Products" ||
      (selectedFilter === "Low Stock Products" && qty < 10) ||
      (selectedFilter === "Out of Stock" && qty === 0);
    const matchesSearch =
      searchQuery === "" ||
      Object.values(item).join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalStock = (products || []).reduce(
    (sum, p) => sum + Number(p.quantity ?? p.qty ?? 0), 0
  );
  const outOfStock = (products || []).filter(
    (p) => Number(p.quantity ?? p.qty ?? 0) === 0
  ).length;
  const lowStock = (products || []).filter((p) => {
    const q = Number(p.quantity ?? p.qty ?? 0);
    return q > 0 && q < 10;
  }).length;

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
    setDropdownIndex(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
  };

  const handleImport = (importedData: unknown[]) => {
    fetchProducts(); // Refresh after bulk import
  };

  return (
    <div className="font-inter pb-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total stock items", value: totalStock },
          { label: "Low stock items", value: lowStock },
          { label: "Out of stock", value: outOfStock },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{formatWithCommas(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 border mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {["All Products", "Low Stock Products", "Out of Stock"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  selectedFilter === f
                    ? "bg-pry text-white border-pry"
                    : "text-gray-500 border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="text-xs px-4 py-2 border border-pry text-pry rounded-lg font-medium"
            >
              Import CSV / Excel
            </button>
            <button
              onClick={() => setShowProductForm(true)}
              className="text-xs px-4 py-2 bg-pry text-white rounded-lg font-medium"
            >
              + Add product
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 w-64 mb-4">
          <img src={search} alt="" className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs outline-none w-full"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-gray-400 border-b">
              <tr>
                <th className="py-3 pr-4">Product</th>
                <th className="pr-4">Category</th>
                <th className="pr-4">Price</th>
                <th className="pr-4">Stock</th>
                <th className="pr-4">Discount</th>
                <th className="pr-4">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No products yet. Add one manually or import a CSV/Excel file.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item, index) => {
                  const qty = Number(item.quantity ?? item.qty ?? 0);
                  const status =
                    qty === 0 ? "Out of stock" : qty < 10 ? "Low stock" : "In stock";
                  const statusColor =
                    qty === 0
                      ? "text-red-500 bg-red-50"
                      : qty < 10
                      ? "text-yellow-600 bg-yellow-50"
                      : "text-green-600 bg-green-50";
                  return (
                    <tr key={item._id || index} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                          <span className="font-medium">{item.name || item.productName}</span>
                        </div>
                      </td>
                      <td className="pr-4 text-gray-500">{item.category}</td>
                      <td className="pr-4 font-medium">
                        ₦{formatWithCommas(item.adminPrice ?? item.price ?? 0)}
                      </td>
                      <td className="pr-4">{formatWithCommas(qty)}</td>
                      <td className="pr-4 text-gray-500">{item.discount || 0}%</td>
                      <td className="pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="relative">
                        <button
                          onClick={() =>
                            setDropdownIndex(dropdownIndex === index ? null : index)
                          }
                        >
                          <img src={dot} alt="options" className="w-4" />
                        </button>
                        {dropdownIndex === index && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-6 bg-white shadow-lg rounded-lg z-10 w-32 border"
                          >
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-xs hover:bg-gray-50"
                            >
                              <img src={edit} alt="" className="w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50"
                            >
                              <img src={deleteIcon} alt="" className="w-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          onClose={async () => { setShowProductForm(false); await fetchProducts(); }}
        />
      )}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => { setShowEditModal(false); setEditingProduct(null); fetchProducts(); }}
        />
      )}
    </div>
  );
};

export default Inventory;
