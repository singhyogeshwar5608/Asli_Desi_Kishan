export type SupportedMediaType = 'IMAGE' | 'VIDEO';

export interface EventMediaItem {
  id: number;
  title: string;
  caption?: string | null;
  description?: string | null;
  altText?: string | null;
  mediaType: SupportedMediaType;
  fileUrl: string;
  thumbnailUrl?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  durationSeconds?: number | null;
  isActive: boolean;
  sortOrder: number;
  meta?: Record<string, unknown> | null;
  uploadedAt?: string | null;
  updatedAt?: string | null;
}

export type MediaStatusFilter = 'all' | 'active' | 'inactive';
export type MediaTypeFilter = 'ALL' | SupportedMediaType;
export type MediaSortOption = 'manual' | 'recent' | 'oldest' | 'title_asc' | 'title_desc';

export interface EventMediaFilters {
  search?: string;
  mediaType?: MediaTypeFilter;
  status?: MediaStatusFilter;
  sort?: MediaSortOption;
  page?: number;
  limit?: number;
}

export interface UploadMediaResponseItem {
  url: string;
  publicId: string;
  mimeType: string;
  bytes: number;
  format: string;
  name: string;
  mediaType: SupportedMediaType;
}

export interface CreateEventMediaPayload {
  title: string;
  caption?: string;
  description?: string;
  altText?: string;
  mediaType: SupportedMediaType;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  isActive?: boolean;
  sortOrder?: number;
  meta?: Record<string, unknown>;
}

export interface UpdateEventMediaPayload extends Partial<CreateEventMediaPayload> {}

export type EventMediaBulkAction = 'activate' | 'deactivate' | 'delete';

export interface ReorderEventMediaItem {
  id: number;
  sortOrder: number;
}
