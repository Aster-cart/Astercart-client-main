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
    console.log(formData);

    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("qty", formData.quantity);
    formDataToSend.append("discount", formData.discount);
    formDataToSend.append("taxRate", formData.taxRate);

    formData.images.forEach((image, index) => {
      formDataToSend.append(`images[${index}]`, image);
    });
    console.log(formData);
    await addProduct(formData);
    onClose();

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
