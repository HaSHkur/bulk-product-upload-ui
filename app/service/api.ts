import axios, { AxiosProgressEvent } from "axios";
import { Product, ProductsResponse, CreateProductPayload } from "@/src/types/product";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE + "/api",
  headers: { "Content-Type": "application/json" },
});

export const productService = {
  
  getProducts: async (page: number = 1, pageSize: number = 20): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", {
      params: { page, pageSize },
    });
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (
    payload: CreateProductPayload,
    onProgress?: (percent: number) => void
  ): Promise<Product> => {
    const formData = new FormData();

    payload.images.forEach((image) => {
      formData.append("files", image);
    });

    const productData = {
      name: payload.name,
      description: payload.description,
      price: payload.price,
    };
    formData.append("product", JSON.stringify(productData));

    const response = await api.post<Product>("products/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (!onProgress) return;
        const loaded = progressEvent.loaded ?? 0;
        const total = progressEvent.total ?? 0;
        if (total > 0) {
          const percentCompleted = Math.round((loaded * 100) / total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
};

export default api;
