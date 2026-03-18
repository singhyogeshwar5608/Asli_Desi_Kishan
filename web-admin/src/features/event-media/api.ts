import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { PaginatedResponse } from '../../types/pagination';
import type {
  CreateEventMediaPayload,
  EventMediaBulkAction,
  EventMediaFilters,
  EventMediaItem,
  ReorderEventMediaItem,
  UpdateEventMediaPayload,
  UploadMediaResponseItem,
} from './types';

const EVENT_MEDIA_KEY = ['event-media'];

const mapEventMedia = (payload: any): EventMediaItem => ({
  id: Number(payload.id),
  title: payload.title ?? 'Untitled media',
  caption: payload.caption ?? undefined,
  description: payload.description ?? undefined,
  altText: payload.altText ?? payload.alt_text ?? undefined,
  mediaType: (payload.mediaType ?? payload.media_type ?? 'IMAGE').toUpperCase(),
  fileUrl: payload.fileUrl ?? payload.file_url ?? '',
  thumbnailUrl: payload.thumbnailUrl ?? payload.thumbnail_url ?? undefined,
  mimeType: payload.mimeType ?? payload.mime_type ?? undefined,
  fileSizeBytes: payload.fileSizeBytes ?? payload.file_size_bytes ?? undefined,
  durationSeconds: payload.durationSeconds ?? payload.duration_seconds ?? undefined,
  isActive: Boolean(payload.isActive ?? payload.is_active ?? true),
  sortOrder: Number(payload.sortOrder ?? payload.sort_order ?? 0),
  meta: payload.meta ?? null,
  uploadedAt: payload.uploadedAt ?? payload.created_at ?? null,
  updatedAt: payload.updatedAt ?? payload.updated_at ?? null,
});

export const fetchEventMedia = async (filters?: EventMediaFilters) => {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    limit: filters?.limit ?? 12,
  };

  if (filters?.search) params.search = filters.search;
  if (filters?.mediaType && filters.mediaType !== 'ALL') params.media_type = filters.mediaType;
  if (filters?.status && filters.status !== 'all') params.status = filters.status;
  if (filters?.sort) params.sort = filters.sort;

  const { data } = await apiClient.get<PaginatedResponse<any>>('/event-media', { params });

  return {
    data: data.data.map(mapEventMedia),
    meta: data.meta,
  } as PaginatedResponse<EventMediaItem>;
};

export const useEventMedia = (filters?: EventMediaFilters) =>
  useQuery({ queryKey: [...EVENT_MEDIA_KEY, filters], queryFn: () => fetchEventMedia(filters) });

const toServerPayload = (payload: Partial<CreateEventMediaPayload>) => {
  const map: Record<string, string> = {
    fileUrl: 'file_url',
    thumbnailUrl: 'thumbnail_url',
    mimeType: 'mime_type',
    fileSizeBytes: 'file_size_bytes',
    durationSeconds: 'duration_seconds',
    mediaType: 'media_type',
    altText: 'alt_text',
    sortOrder: 'sort_order',
    isActive: 'is_active',
  };

  return Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[map[key] ?? key] = value;
    return acc;
  }, {});
};

export const useCreateEventMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEventMediaPayload) => {
      const { data } = await apiClient.post<{ media: any }>('/event-media', toServerPayload(payload));
      return mapEventMedia(data.media);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_MEDIA_KEY }),
  });
};

export const useUpdateEventMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateEventMediaPayload }) => {
      const { data } = await apiClient.patch<{ media: any }>(`/event-media/${id}`, toServerPayload(payload));
      return mapEventMedia(data.media);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_MEDIA_KEY }),
  });
};

export const useDeleteEventMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/event-media/${id}`);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_MEDIA_KEY }),
  });
};

export const useBulkEventMediaAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, action }: { ids: number[]; action: EventMediaBulkAction }) => {
      const { data } = await apiClient.post<{ affected: number }>('/event-media/bulk', { ids, action });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_MEDIA_KEY }),
  });
};

export const useReorderEventMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: ReorderEventMediaItem[]) => {
      const { data } = await apiClient.post<{ reordered: number }>('/event-media/reorder', { order });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EVENT_MEDIA_KEY }),
  });
};

export const useUploadEventMedia = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files[]', file));
      const { data } = await apiClient.post<{ files: UploadMediaResponseItem[] }>('/event-media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.files;
    },
  });
};
