export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  images: File[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ProductsResponse = PaginatedResponse<Product>;
