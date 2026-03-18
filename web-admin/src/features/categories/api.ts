import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { CategorySummary } from './types';
import type { PaginatedResponse } from '../../types/pagination';

const CATEGORIES_KEY = ['categories'];

export interface CategoryFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'ALL';
  page?: number;
  limit?: number;
}

const serializeStatus = (status?: CategoryFilters['status']) => {
  if (!status || status === 'ALL') return undefined;
  if (status === 'active') return true;
  if (status === 'inactive') return false;
  return undefined;
};

export const fetchCategories = async (filters?: CategoryFilters) => {
  const params: Record<string, string | number | boolean> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 20,
  };
  if (filters?.search) params.search = filters.search;
  const statusValue = serializeStatus(filters?.status);
  if (typeof statusValue === 'boolean') params.status = statusValue;
  const { data } = await apiClient.get<PaginatedResponse<CategorySummary>>('/categories', { params });
  return data;
};

export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({ queryKey: [...CATEGORIES_KEY, filters], queryFn: () => fetchCategories(filters) });
};

export const fetchCategoryOptions = async () => {
  const response = await fetchCategories({ status: 'active', limit: 200, page: 1 });
  return response.data;
};

export const useCategoryOptions = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, 'options'],
    queryFn: fetchCategoryOptions,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const { data } = await apiClient.post<{ category: CategorySummary }>('/categories', payload);
      return data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateCategoryPayload> }) => {
      const { data } = await apiClient.patch<{ category: CategorySummary }>(`/categories/${id}`, payload);
      return data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
};
