import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { AdkEvent, AdkEventFilters, AdkEventPayload } from './types';

const ADK_EVENTS_KEY = ['adk-events'];

const mapAdkEvent = (payload: any): AdkEvent => ({
  id: Number(payload.id),
  leaderName: payload.leaderName ?? payload.leader_name ?? '',
  meetingDate: payload.meetingDate ?? payload.meeting_date ?? '',
  meetingTime: payload.meetingTime ?? payload.meeting_time ?? '',
  storeName: payload.storeName ?? payload.store_name ?? '',
  address: payload.address ?? '',
  state: payload.state ?? '',
  city: payload.city ?? '',
  leaderMobile: payload.leaderMobile ?? payload.leader_mobile ?? '',
  storeMobile: payload.storeMobile ?? payload.store_mobile ?? '',
  notes: payload.notes ?? null,
  createdAt: payload.createdAt ?? payload.created_at ?? null,
  updatedAt: payload.updatedAt ?? payload.updated_at ?? null,
});

const toServerPayload = (payload: Partial<AdkEventPayload>) => {
  const map: Record<string, string> = {
    leaderName: 'leader_name',
    meetingDate: 'meeting_date',
    meetingTime: 'meeting_time',
    storeName: 'store_name',
    leaderMobile: 'leader_mobile',
    storeMobile: 'store_mobile',
  };

  return Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[map[key] ?? key] = value;
    return acc;
  }, {});
};

export interface PaginatedAdkEvents {
  data: AdkEvent[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

export const fetchAdkEvents = async (filters?: AdkEventFilters): Promise<PaginatedAdkEvents> => {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 10,
  };

  if (filters?.search) params.search = filters.search;
  if (filters?.startDate) params.start_date = filters.startDate;
  if (filters?.endDate) params.end_date = filters.endDate;

  const { data } = await apiClient.get<{ data: any[]; meta: PaginatedAdkEvents['meta'] }>('/admin/events', { params });

  return {
    data: (data.data ?? []).map(mapAdkEvent),
    meta: data.meta,
  };
};

export const useAdkEvents = (filters?: AdkEventFilters) =>
  useQuery({ queryKey: [...ADK_EVENTS_KEY, filters], queryFn: () => fetchAdkEvents(filters) });

export const useCreateAdkEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdkEventPayload) => {
      const { data } = await apiClient.post<{ event: any }>('/admin/events', toServerPayload(payload));
      return mapAdkEvent(data.event);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADK_EVENTS_KEY }),
  });
};

export const useUpdateAdkEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<AdkEventPayload> }) => {
      const { data } = await apiClient.put<{ event: any }>(`/admin/events/${id}`, toServerPayload(payload));
      return mapAdkEvent(data.event);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADK_EVENTS_KEY }),
  });
};

export const useDeleteAdkEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/events/${id}`);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADK_EVENTS_KEY }),
  });
};
