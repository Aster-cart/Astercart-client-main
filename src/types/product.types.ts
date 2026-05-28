export interface ProductStore {
  products: Product[] | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product:ProductForm) => Promise<void>;
  updateProduct: (id: string, product: Record<string, unknown>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export interface Product {
  productId: string;
  name: string;
  category: string;
  description: string;
  price: string | number;
  quantity: string | number;
  supplier: string;
  discount: string;
  taxRate: string;
  image: string;
  [key: string]: string | number;
}
export interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
  discount: string;
  taxRate: string;
  images: File[]; // Ensure this matches your `Product` type definition
}


export type InventoryItem = {
  productId: string;
  name: string;
  category: string;
  description: string;
  price: string | number;
  quantity: string | number;
  supplier: string;
  discount: string;
  taxRate: string;
  image: string;
  [key: string]: string | number;
};