import { toast } from "react-toastify";
import { useState } from "react";
import { useProductStore } from "../store/productStore";
import { ProductForm } from "../types/product.types";
import api from "../utils/api";


export const useInventoryProduct = (
  onClose: () => void,
) => {
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    discount: "",
    taxRate: "",
    images: [],
  });
  const { addProduct } = useProductStore();

  const [currentStep, setCurrentStep] = useState(1);

  const [images, setImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]); // Array of strings (real Cloudinary URLs once uploaded) or null
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0, 0]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Show a quick local preview immediately (still a blob URL, but ONLY
    // ever used for the instant on-screen preview while uploading — it is
    // NEVER sent to the server or saved anywhere). The moment the real
    // upload finishes, this preview is replaced with the actual permanent
    // Cloudinary URL.
    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev];
      next[index] = previewUrl;
      return next;
    });
    setUploadProgress((prev) => {
      const next = [...prev];
      next[index] = 10; // show some immediate progress feedback
      return next;
    });

    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post<{ url: string; publicId: string }>(
        "/upload/product-image",
        body,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Replace the temporary blob preview with the REAL, permanent
      // Cloudinary URL — this is what actually gets saved on the product
      // and is what makes the image visible on every device, not just
      // this browser tab.
      setImages((prev) => {
        const next = [...prev];
        next[index] = data.url;
        return next;
      });
      setUploadProgress((prev) => {
        const next = [...prev];
        next[index] = 100;
        return next;
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Image upload failed. Please try again.");
      setImages((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setUploadProgress((prev) => {
        const next = [...prev];
        next[index] = 0;
        return next;
      });
    }
  };

  const addMoreSlots = () => {
    setImages((prevImages) => [...prevImages, null]);
    setUploadProgress((prevProgress) => [...prevProgress, 0]);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      console.log(formData);
    }
  };

  const handleAdd = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      toast.error("Please fill in all required fields: name, price, quantity and category.");
      return;
    }

    // Block submission while any image is still mid-upload — otherwise a
    // store could save the product with a temporary blob preview URL
    // still in place if they submit before the real upload finishes.
    if (uploadProgress.some((p, i) => images[i] && p < 100)) {
      toast.error("Please wait for all images to finish uploading.");
      return;
    }

    // Build clean product object with correct field names the server expects
    const productPayload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      discount: Number(formData.discount) || 0,
      taxRate: Number(formData.taxRate) || 0,
      // Only real, permanent Cloudinary URLs ever reach this point now —
      // blob: URLs are filtered out as an extra safety net, in case a
      // preview URL somehow slipped through.
      images: images.filter((img): img is string => typeof img === "string" && !img.startsWith("blob:")),
    };

    try {
      await addProduct(productPayload);
      toast.success("Product added successfully!");
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to save product.";
      toast.error(msg);
    }
  };


  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
};


  return {
    formData,
    images,
    uploadProgress,
    handleFileChange,
    addMoreSlots,
    handleNextStep,
    handleAdd,
    handleChange,
    currentStep,
  };
};
