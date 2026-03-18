export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  actualPrice: number;
  totalPrice: number;
  bv: number;
  stock: number;
  description?: string;
  categories?: string[];
  images?: Array<{ url: string; alt?: string }>;
  isActive: boolean;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
