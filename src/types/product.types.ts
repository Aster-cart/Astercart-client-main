export interface ProductStore {
  products: Product[] | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product:ProductForm) => Promise<void>;
  updateProduct: (id: string, product: Record<string, unknown>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export interface Product {
  _id?: string;
  productId?: string;
  name: string;
  category: string;
  description: string;
  price: string | number;
  quantity: string | number;
  supplier?: string;
  discount: string | number;
  taxRate: string | number;
  image?: string;
  images?: string[] | string | number;
  [key: string]: unknown;
}

export interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string | number;
  quantity: string | number;
  discount: string | number;
  taxRate: string | number;
  images?: File[] | string[];
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