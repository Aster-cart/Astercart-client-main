import { create } from "zustand";
import "react-toastify/dist/ReactToastify.css";
import { ProductStore } from "../types/product.types";
import api from "../utils/api";

export const useProductStore = create<ProductStore>((set) => ({
  products:null,
  fetchProducts: async () => {
    try {
      const response = await api.get(`/store/all-products`); 
      console.log(response.data.products);
           
      set((state)=>({...state, products: response.data.products}));
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
     
      // set((state) => ({ products: data }));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  },
  addProduct: async (product) => {
    try {
      await api.post(`/store/create-product`, [product]);
      // Always refresh list immediately after adding
      const response = await api.get(`/store/all-products`);
      set((state) => ({ ...state, products: response.data.products }));
    } catch (error: any) {
      console.error("Error adding product:", error);
      // Re-throw so the UI can display the real error to the user
      throw error;
    }
  },
  updateProduct: async (id: string, product: Record<string, unknown>) => {
    try {
      await api.put(`/store/update-product/${id}`, product);
      const response = await api.get(`/store/all-products`);
      set((state) => ({ ...state, products: response.data.products }));
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },
  deleteProduct: async (id: string) => {
    try {
      await api.delete(`/store/delete-product/${id}`);
      const response = await api.get(`/store/all-products`);
      set((state) => ({ ...state, products: response.data.products }));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
}));





// const data = [
//   {
//     sn: "1",
//     productId: "P001",
//     productName: "Wireless Mouse",
//     category: "Electronics",
//     description: "A wireless mouse with ergonomic design.",
//     price: "20.0",
//     qty: "2000",
//     supplier: "TechCo",
//     discount: "8",
//     taxRate: "218",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxSoL46b6lEz1Jxfct2detddeQc7DTafm9Kg&s",
//   },
//   {
//     sn: "2",
//     productId: "P002",
//     productName: "Laptop Stand",
//     category: "Accessories",
//     description: "Adjustable laptop stand for ergonomic comfort.",
//     price: "235.0",
//     qty: "2000",
//     supplier: "OfficeWorks",
//     discount: "10",
//     taxRate: "230.0",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl7YI9xc5yR9mN_3VM_7-AoP1jsVVOTquO_w&s",
//   },
//   {
//     sn: "3",
//     productId: "P003",
//     productName: "Bluetooth Speaker",
//     category: "Electronics",
//     description: "Portable Bluetooth speaker with high bass sound.",
//     price: "250.0",
//     qty: "2000",
//     supplier: "SoundMax",
//     discount: "5",
//     taxRate: "245.0",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM4mM5rj4uaM-kW2BO8Xo-xDQpBtFOj4uXmQ&s",
//   },
//   {
//     sn: "4",
//     productId: "P004",
//     productName: "USB-C Cable",
//     category: "Accessories",
//     description: "Durable USB-C cable for fast charging and data transfer.",
//     price: "210.0",
//     qty: "2000",
//     supplier: "CableTech",
//     discount: "12",
//     taxRate: "28.5",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsxWgT9FNxaXwgHqoyv11NWxhlakziaGetgA&s",
//   },
//   {
//     sn: "5",
//     productId: "P005",
//     productName: "LED Desk Lamp",
//     category: "Home & Office",
//     description: "Energy-efficient LED desk lamp with adjustable brightness.",
//     price: "240.0",
//     qty: "2000",
//     supplier: "BrightLite",
//     discount: "7",
//     taxRate: "235.0",
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBInMaRaIYtmM4HM6OJZp-2YWeDyJQtioJtA&s",
//   },
// ]