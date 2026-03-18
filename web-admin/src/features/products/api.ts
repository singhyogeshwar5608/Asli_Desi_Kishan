import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse, ProductSummary } from './types';

const PRODUCTS_KEY = ['products'];

const mapProduct = (product: any): ProductSummary => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  actualPrice: Number(product.actual_price ?? product.actualPrice ?? 0),
  totalPrice: Number(product.total_price ?? product.totalPrice ?? 0),
  bv: Number(product.bv ?? 0),
  stock: Number(product.stock ?? 0),
  description: product.description ?? undefined,
  categories: Array.isArray(product.categories) ? product.categories : [],
  images: Array.isArray(product.images) ? product.images : [],
  isActive: Boolean(product.is_active ?? product.isActive ?? false),
  createdAt: product.created_at ?? product.createdAt ?? undefined,
});

export const fetchProducts = async () => {
  const { data } = await apiClient.get<PaginatedResponse<ProductSummary>>('/products', {
    params: { page: 1, limit: 10 },
  });
  return {
    data: data.data.map(mapProduct),
    meta: data.meta,
  };
};

export const useProducts = () => {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: fetchProducts });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, isActive }: { product: ProductSummary; isActive: boolean }) => {
      const payload = toServerPayload({
        sku: product.sku,
        name: product.name,
        actualPrice: product.actualPrice,
        totalPrice: product.totalPrice,
        bv: product.bv,
        stock: product.stock,
        description: product.description,
        categories: product.categories,
        images: product.images,
        isActive,
      });
      const { data } = await apiClient.patch<{ product: any }>(`/products/${product.id}`, payload);
      return mapProduct(data.product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
};

interface CreateProductPayload {
  name: string;
  sku: string;
  actualPrice: number;
  totalPrice: number;
  bv: number;
  stock: number;
  description?: string;
  categories?: string[];
  images?: Array<{ url: string; alt?: string }>;
  isActive?: boolean;
}

const toServerPayload = (payload: Partial<CreateProductPayload>) => {
  const map: Record<string, string> = {
    actualPrice: 'actual_price',
    totalPrice: 'total_price',
    isActive: 'is_active',
  };

  return Object.entries(payload).reduce<Record<string, unknown>>((result, [key, value]) => {
    if (value === undefined) return result;
    const serverKey = map[key] ?? key;
    result[serverKey] = value;
    return result;
  }, {});
};

export interface UploadedProductMedia {
  url: string;
  secureUrl: string;
  publicId: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  name: string;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await apiClient.post<{ product: any }>(`/products`, toServerPayload(payload));
      return mapProduct(data.product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) => {
      const { data } = await apiClient.patch<{ product: any }>(`/products/${id}`, toServerPayload(payload));
      return mapProduct(data.product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
      return id;
    },
    onSuccess: (deletedProductId) => {
      queryClient.setQueryData<PaginatedResponse<ProductSummary> | undefined>(
        PRODUCTS_KEY,
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            data: previous.data.filter((product) => product.id !== deletedProductId),
            meta: {
              ...previous.meta,
              total: Math.max(0, previous.meta.total - 1),
            },
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
};

export const useUploadProductMedia = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const { data } = await apiClient.post<{ files: UploadedProductMedia[] }>(
        '/media/products',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return data.files;
    },
  });
};
