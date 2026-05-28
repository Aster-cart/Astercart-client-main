import { useInventoryProduct } from "../hooks/useInventoryProduct";
import { base, gallery } from "../assets/res";
import { useEffect, useState } from "react";
import api from "../utils/api";

interface Product {
  productName: string;
  description: string;
  category: string;
  price: string;
  qty: string;
  discount: string;
  taxRate: string;
  images: File[]; // Array of File objects
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  onClose: () => void;
  onAdd: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose }) => {
  const {
    formData,
    images,
    uploadProgress,
    handleFileChange,
    addMoreSlots,
    handleNextStep,
    handleAdd,
    handleChange,
    currentStep,
  } = useInventoryProduct(onClose);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

 useEffect(() => {
  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const response = await api.get("/store/getAll-category");
      setCategories(response.data); 
    } catch (err: any) {
      setCategoryError(
        err.response?.data?.message || "Failed to load categories"
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  fetchCategories();
}, []);


  return (
    <div className="flex font-inter flex-col">
      <div className="flex-grow overflow-x-auto bg-white mx-2 rounded-2xl p-5 scrollbar-hide h-[calc(100vh-120px)]">
        <div className="overflow-y-auto">
          <div className="flex mb-3">
            <p className="text-lg  font-semibold leading-6">Add new product</p>
          </div>
          {/* Scrollable Form Section */}
          <form
            onSubmit={handleAdd}
            className="border w-[80%] mb-5 font-inter pb-5 p-5 rounded-lg flex flex-col "
          >
            {/* First Page: Product Information */}
            {currentStep === 1 && (
              <>
                <div className="flex mb-3 flex-col">
                  <div className="flex mb-3 w-[80%] justify-between">
                    <p className="leading-7 pb-1 text-base font-semibold text-[#2D2D2D]">
                      Product Information
                    </p>
                    <img className="" src={base} alt="Header logo" />
                  </div>
                  <p className="text-[#667085] pb-3 leading-5 text-sm">
                    Share details about your product to help buyers know what to
                    expect.
                  </p>
                  <div className="w-[80%] h-px bg-[#EFEFF4]"></div>
                </div>

                {/* Product input */}
                <div className="mb-4">
                  <label
                    htmlFor="productName"
                    className="block text-sm text-input leading-5 font-medium"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formData.name ? "bg-fade" : "bg-bginput"
                    }`}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm text-input leading-5 font-medium"
                  >
                    Product Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formData.description ? "bg-fade" : "bg-bginput"
                    }`}
                    placeholder="Enter product description"
                    required
                  />
                </div>

                {/* Category and Price Inputs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="w-[40%]">
                    <label
                      htmlFor="category"
                      className="block text-sm text-input leading-5 font-medium"
                    >
                      Category
                    </label>

                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formData.category ? "bg-fade" : "bg-bginput"
                      }`}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    {categoryLoading && (
                      <p className="text-xs mt-1 text-gray-500">Loading...</p>
                    )}
                    {categoryError && (
                      <p className="text-xs mt-1 text-red-500">
                        {categoryError}
                      </p>
                    )}
                  </div>
                  <div className="w-[40%]">
                    <label
                      htmlFor="price"
                      className="block text-sm text-input leading-5 font-medium"
                    >
                      Price
                    </label>

                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formData.price ? "bg-fade" : "bg-bginput"
                      }`}
                      placeholder="Enter product price"
                    />
                  </div>
                </div>

                {/* Quantity*/}
                <div className="mb-4">
                  <label
                    htmlFor="qty"
                    className="block text-sm text-input leading-5 font-medium"
                  >
                    Quantity
                  </label>
                  <input
                    type="text"
                    id="qty"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      formData.quantity ? "bg-fade" : "bg-bginput"
                    }`}
                    placeholder="Enter product quantity"
                    required
                  />
                </div>
                {/* Discount*/}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="w-[40%]">
                    <label
                      htmlFor="discount"
                      className="block text-sm text-input leading-5 font-medium"
                    >
                      Discount
                    </label>
                    <input
                      type="text"
                      id="discount"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formData.discount ? "bg-fade" : "bg-bginput"
                      }`}
                      placeholder="Enter product discount"
                      required
                    />
                  </div>
                  {/* Tax*/}
                  <div className="w-[40%]">
                    <label
                      htmlFor="taxRate"
                      className="block text-sm text-input leading-5 font-medium"
                    >
                      Tax Rate
                    </label>

                    <input
                      type="text"
                      id="taxRate"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleChange}
                      className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        formData.taxRate ? "bg-fade" : "bg-bginput"
                      }`}
                      placeholder="Enter product tax"
                    />
                  </div>
                </div>

                {/* Next Button */}

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 text-white bg-orange-300 hover:bg-pry py-2 rounded"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Second Page: Product Media */}
            {currentStep === 2 && (
              <>
                <div className="mb-4">
                  <div className="flex mb-3 w-[80%] justify-between">
                    <p className="leading-7 pb-1 text-base font-semibold text-[#2D2D2D]">
                      Product Media
                    </p>
                    <img className="" src={base} alt="Header logo" />
                  </div>
                  <p className="text-[#667085] pb-3 leading-5 text-sm">
                    Add clear and detailed media of your product.
                  </p>
                  <div className="w-[80%] h-px bg-[#EFEFF4]"></div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col gap-3">
                    <p>Product Thumbnails</p>
                    <p className="text-[#667085] ot-3">
                      Upload clear product images below. <br />
                      Jpg or png format, only. Minimum 1000 x 1000 px (Square
                      Dimension with 1:1 Ratio).
                    </p>
                  </div>
                  <div className="flex flex-wrap mt-5 justify-between gap-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-[23%] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center"
                      >
                        {/* Blurred Image Container */}
                        {image && (
                          <div
                            className="w-full h-full rounded-lg bg-cover bg-center transition-all"
                            style={{
                              backgroundImage: `url(${image})`,
                              filter: `blur(${
                                10 - uploadProgress[index] / 10
                              }px)`,
                              opacity: uploadProgress[index] > 0 ? 1 : 0.3, // Maintain opacity until upload starts
                            }}
                          ></div>
                        )}

                        {/* Uploading Text and Percentage */}
                        {image && uploadProgress[index] < 100 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                            <p className="text-lg font-bold text-white">
                              Uploading
                            </p>
                            <p className="text-sm mt-1 text-white">
                              {uploadProgress[index]}%
                            </p>
                          </div>
                        )}

                        {/* Placeholder for Upload */}
                        {!image && (
                          <div className="absolute inset-0 flex flex-col justify-center items-center">
                            <img
                              src={gallery} // Replace with your placeholder image
                              alt="Gallery placeholder"
                              className="mb-2 mx-auto"
                            />
                            <div
                              className="cursor-pointer text-blue-500"
                              onClick={() =>
                                document
                                  .getElementById(`file-input-${index}`)
                                  ?.click()
                              }
                            >
                              <p className="text-sm px-5 text-gray-500">
                                Click here to upload or drag and drop
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, index)}
                              id={`file-input-${index}`}
                            />
                          </div>
                        )}

                        {/* Progress Bar Outside the Box */}
                        {image && uploadProgress[index] < 100 && (
                          <div className="absolute bottom-[-10px] left-0 w-full">
                            <div className="w-full mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 transition-all"
                                style={{ width: `${uploadProgress[index]}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button" // Ensures this button does not act as a submit button
                    onClick={addMoreSlots}
                    className="mt-5 w-full border border-pry px-4 py-2 text-pry font-semibold rounded-lg "
                  >
                    + Add More Thumbnail Slots
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 text-white bg-orange-300 hover:bg-pry py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
