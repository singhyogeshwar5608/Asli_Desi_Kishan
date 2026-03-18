import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { OrderStatus, PaginatedResponse, OrderSummary, PaymentStatus } from './types';

const ORDERS_KEY = ['orders'];

export interface OrderFilters {
  status?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  memberSearch?: string;
}

const sanitizeFilters = (filters?: OrderFilters) => {
  if (!filters) return {};
  const params: Record<string, string> = {};
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;
  if (filters.paymentStatus && filters.paymentStatus !== 'ALL') params.paymentStatus = filters.paymentStatus;
  if (filters.memberSearch) params.memberSearch = filters.memberSearch;
  return params;
};

export const fetchOrders = async (filters?: OrderFilters) => {
  const params = sanitizeFilters(filters);
  const { data } = await apiClient.get<PaginatedResponse<OrderSummary>>('/orders', {
    params: { page: 1, limit: 10, ...params },
  });
  return data;
};

export const useOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: [...ORDERS_KEY, filters],
    queryFn: () => fetchOrders(filters),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) => {
      const { data } = await apiClient.post<{ order: OrderSummary }>(`/orders/${id}/status`, {
        status,
        note,
      });
      return data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
};

export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { data } = await apiClient.post<{ order: OrderSummary }>(`/orders/${id}/refund`, {
        note,
      });
      return data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
};
