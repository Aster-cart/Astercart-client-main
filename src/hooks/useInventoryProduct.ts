import { toast } from "react-toastify";
import { useState } from "react";
import { useProductStore } from "../store/productStore";
import { ProductForm } from "../types/product.types";


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
  ]); // Array of strings (URLs) or null
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0, 0]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const newImages = [...images];
      newImages[index] = URL.createObjectURL(file);
      setImages(newImages);

      // Add the file to `formData.images`
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [...prevFormData.images, file],
      }));

      // Simulate upload progress
      simulateUploadProgress(index);
    }
  };

  const simulateUploadProgress = (index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10; // Simulate 10% increments
      setUploadProgress((prevProgress) => {
        const updatedProgress = [...prevProgress];
        updatedProgress[index] = progress;
        return updatedProgress;
      });

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500); // Adjust interval speed as needed
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

    // Build clean product object with correct field names the server expects
    const productPayload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      discount: Number(formData.discount) || 0,
      taxRate: Number(formData.taxRate) || 0,
      // Only include image URLs (strings), not File objects
      images: images.filter((img): img is string => typeof img === "string"),
    };

    try {
      await addProduct(productPayload);
      toast.success("Product added successfully!");
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to save product.";
      toast.error(msg);
    }

    // setFormData({
    //   name: "",
    //   description: "",
    //   category: "",
    //   price: "",
    //   quantity: "",
    //   discount: "",
    //   taxRate: "",
    //   images: [],
    // });

    // setImages([null, null, null, null]);
    // setUploadProgress([0, 0, 0, 0]);
    // setCurrentStep(1);
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
