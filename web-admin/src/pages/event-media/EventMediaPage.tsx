import { Fragment, useMemo, useState, useEffect } from 'react';
import { RefreshCw, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  useBulkEventMediaAction,
  useCreateEventMedia,
  useDeleteEventMedia,
  useEventMedia,
  useUpdateEventMedia,
  useUploadEventMedia,
} from '../../features/event-media/api';
import type {
  CreateEventMediaPayload,
  EventMediaBulkAction,
  EventMediaFilters,
  EventMediaItem,
  MediaSortOption,
  MediaStatusFilter,
  MediaTypeFilter,
  UploadMediaResponseItem,
} from '../../features/event-media/types';
import { MediaTypeTabs } from '../../features/event-media/components/MediaTypeTabs';
import { UploadDropzone } from '../../features/event-media/components/UploadDropzone';
import { MediaCard } from '../../features/event-media/components/MediaCard';
import { useMediaSelection } from '../../features/event-media/hooks/useMediaSelection';
import { Modal } from '../../components/modal';

const statusOptions: Array<{ label: string; value: MediaStatusFilter }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active only', value: 'active' },
  { label: 'Inactive only', value: 'inactive' },
];

const sortOptions: Array<{ label: string; value: MediaSortOption }> = [
  { label: 'Recently added', value: 'recent' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Manual order', value: 'manual' },
  { label: 'Title A-Z', value: 'title_asc' },
  { label: 'Title Z-A', value: 'title_desc' },
];

export const EventMediaPage = () => {
  const [filters, setFilters] = useState<EventMediaFilters>({ search: '', mediaType: 'ALL', status: 'all', sort: 'recent', page: 1, limit: 12 });
  const [previewItem, setPreviewItem] = useState<EventMediaItem | null>(null);
  const [editItem, setEditItem] = useState<EventMediaItem | null>(null);
  const [metadataQueue, setMetadataQueue] = useState<UploadMediaResponseItem[]>([]);
  const [draftValues, setDraftValues] = useState<CreateEventMediaPayload | null>(null);
  const { data, isLoading, isError, isFetching, refetch } = useEventMedia(filters);
  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.pages ?? 1;
  const selection = useMediaSelection();
  const uploadMutation = useUploadEventMedia();
  const updateMutation = useUpdateEventMedia();
  const deleteMutation = useDeleteEventMedia();
  const bulkMutation = useBulkEventMediaAction();
  const createMutation = useCreateEventMedia();

  const counts = useMemo(
    () => ({
      ALL: data?.meta?.total ?? items.length,
      IMAGE: items.filter((item) => item.mediaType === 'IMAGE').length,
      VIDEO: items.filter((item) => item.mediaType === 'VIDEO').length,
    }),
    [data?.meta?.total, items]
  );

  const handleUpload = async (files: File[]) => {
    try {
      const uploaded = await uploadMutation.mutateAsync(files);
      setMetadataQueue((prev) => [...prev, ...uploaded]);
      toast.message('Upload complete', {
        description: 'Add details and save to finish creating media items.',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Upload failed');
    }
  };

  useEffect(() => {
    if (metadataQueue.length === 0) {
      setDraftValues(null);
      return;
    }

    const next = metadataQueue[0];
    setDraftValues((prev) => {
      if (prev && prev.fileUrl === next.url) return prev;
      return {
        title: next.name ?? 'Untitled media',
        caption: '',
        description: '',
        altText: '',
        mediaType: next.mediaType,
        fileUrl: next.url,
        mimeType: next.mimeType,
        fileSizeBytes: next.bytes,
        isActive: true,
      };
    });
  }, [metadataQueue]);

  const handleDraftFieldChange = <K extends keyof CreateEventMediaPayload>(field: K, value: CreateEventMediaPayload[K]) => {
    setDraftValues((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveDraft = async () => {
    if (!draftValues) return;
    try {
      await createMutation.mutateAsync(draftValues);
      toast.success('Media details saved');
      setMetadataQueue((prev) => prev.slice(1));
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to save media');
    }
  };

  const handleSkipDraft = () => {
    setMetadataQueue((prev) => prev.slice(1));
    toast.info('Upload kept without metadata. You can edit later.');
  };

  const handleBulk = async (action: EventMediaBulkAction) => {
    if (!selection.hasSelection) return;
    try {
      await bulkMutation.mutateAsync({ ids: selection.selectedIds, action });
      toast.success('Bulk action completed');
      selection.clear();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Bulk action failed');
    }
  };

  const handleToggleStatus = async (item: EventMediaItem) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, payload: { isActive: !item.isActive } });
      toast.success(`${item.title} is now ${item.isActive ? 'inactive' : 'active'}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Unable to update status');
    }
  };

  const handleDelete = async (item: EventMediaItem) => {
    const confirmed = window.confirm(`Delete "${item.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      if (selection.isSelected(item.id)) selection.deselect(item.id);
      toast.success('Media deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Delete failed');
    }
  };

  const handleCopyLink = async (item: EventMediaItem) => {
    try {
      await navigator.clipboard.writeText(item.fileUrl);
      toast.success('Media link copied');
    } catch (error) {
      console.warn('Clipboard unavailable', error);
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenPreview = (item: EventMediaItem) => setPreviewItem(item);
  const handleOpenEdit = (item: EventMediaItem) => setEditItem(item);
  const closePreview = () => setPreviewItem(null);
  const closeEdit = () => setEditItem(null);

  const handleMediaTypeChange = (value: MediaTypeFilter) => setFilters((prev) => ({ ...prev, mediaType: value, page: 1 }));
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }));
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, status: event.target.value as MediaStatusFilter, page: 1 }));
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, sort: event.target.value as MediaSortOption, page: 1 }));
  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, limit: Number(event.target.value), page: 1 }));
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Events</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Event Media Gallery</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload and curate imagery & video assets.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin" />}
          <button type="button" onClick={() => refetch()} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600">
            Refresh
          </button>
        </div>
      </div>

      <UploadDropzone onFiles={handleUpload} isUploading={uploadMutation.isPending} helperText="Images & videos up to 25MB each." />

      <div className="space-y-4 rounded-3xl bg-white/80 p-4 shadow-card dark:bg-slate-900/70">
        <MediaTypeTabs value={filters.mediaType ?? 'ALL'} onChange={handleMediaTypeChange} counts={counts} />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Search by title or caption"
                className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-white"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selection.hasSelection && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          <span className="font-semibold">{selection.selectedCount} selected</span>
          <button type="button" onClick={() => selection.clear()} className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold">
            Clear
          </button>
          <button type="button" onClick={() => handleBulk('activate')} className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold">
            Activate
          </button>
          <button type="button" onClick={() => handleBulk('deactivate')} className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold">
            Deactivate
          </button>
          <button type="button" onClick={() => handleBulk('delete')} className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600">
            Delete
          </button>
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-200 bg-white/80 p-6 text-center text-rose-600 dark:border-rose-400/40 dark:bg-slate-900/60">
          <p className="font-semibold">Unable to load media.</p>
          <button type="button" onClick={() => refetch()} className="mt-3 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      )}

      {!isLoading && items.length === 0 && !isError && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center text-slate-500 dark:border-white/10 dark:bg-slate-900/40">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
          <p className="text-lg font-semibold text-slate-700 dark:text-white">No media yet</p>
          <p className="text-sm">Upload images or videos to populate the gallery.</p>
        </div>
      )}

      {isLoading && items.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-3xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <div className="mb-4 h-44 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 lg:grid-cols-2 xl:grid-cols-3 ${isFetching ? 'opacity-75 transition' : ''}`}>
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selection.isSelected(item.id)}
              onSelect={(id, isSelected) => (isSelected ? selection.select(id) : selection.deselect(id))}
              onToggleStatus={(target) => handleToggleStatus(target)}
              onDelete={(target) => handleDelete(target)}
              onPreview={(target) => handleOpenPreview(target)}
              onEdit={(target) => handleOpenEdit(target)}
              onOpenLink={(target) => handleCopyLink(target)}
            />
          ))}
        </div>
      )}

      {meta && meta.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 px-6 py-4 text-sm text-slate-600 shadow-card dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Showing</span>
            <select
              value={filters.limit}
              onChange={handleLimitChange}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            >
              {[12, 24, 48].map((value) => (
                <option key={value} value={value}>
                  {value} per page
                </option>
              ))}
            </select>
            <p>
              {meta.page} / {totalPages} pages · {meta.total} items
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {previewItem && (
        <Modal
          onClose={closePreview}
          title={previewItem.title}
          subtitle={previewItem.mediaType === 'IMAGE' ? 'Image preview' : 'Video preview'}
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => handleCopyLink(previewItem)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10">
                Copy link
              </button>
              <button type="button" onClick={closePreview} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                Close
              </button>
            </div>
          }
        >
          {previewItem.mediaType === 'IMAGE' ? (
            <img src={previewItem.fileUrl} alt={previewItem.altText ?? previewItem.title} className="max-h-[70vh] w-full rounded-2xl object-contain" />
          ) : (
            <video src={previewItem.fileUrl} controls className="max-h-[70vh] w-full rounded-2xl bg-black" poster={previewItem.thumbnailUrl ?? undefined}>
              Your browser does not support the video tag.
            </video>
          )}
        </Modal>
      )}

      {draftValues && (
        <Modal
          onClose={handleSkipDraft}
          title="Add media details"
          subtitle="Provide metadata so the upload is stored"
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSkipDraft}
                disabled={createMutation.isPending}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/80"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={createMutation.isPending}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {createMutation.isPending ? 'Saving…' : 'Save media'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Title</label>
              <input
                type="text"
                value={draftValues.title}
                onChange={(event) => handleDraftFieldChange('title', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Caption</label>
                <input
                  type="text"
                  value={draftValues.caption}
                  onChange={(event) => handleDraftFieldChange('caption', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Alt text</label>
                <input
                  type="text"
                  value={draftValues.altText}
                  onChange={(event) => handleDraftFieldChange('altText', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Description</label>
              <textarea
                value={draftValues.description}
                onChange={(event) => handleDraftFieldChange('description', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Media type</label>
                <select
                  value={draftValues.mediaType}
                  onChange={(event) => handleDraftFieldChange('mediaType', event.target.value as CreateEventMediaPayload['mediaType'])}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</label>
                <select
                  value={draftValues.isActive ? 'active' : 'inactive'}
                  onChange={(event) => handleDraftFieldChange('isActive', event.target.value === 'active')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Thumbnail URL</label>
                <input
                  type="text"
                  value={draftValues.thumbnailUrl ?? ''}
                  onChange={(event) => handleDraftFieldChange('thumbnailUrl', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                  placeholder="Optional CDN thumbnail"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">File URL</label>
                <input
                  type="text"
                  value={draftValues.fileUrl}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {editItem && (
        <Modal
          onClose={closeEdit}
          title={`Edit ${editItem.title}`}
          subtitle="Metadata editing coming soon"
          footer={
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeEdit} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10">
                Cancel
              </button>
              <button type="button" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white" disabled>
                Save (soon)
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-500 dark:text-slate-300">
            The metadata editing flow will live here. For now, this modal demonstrates focus trapping, ESC handling, and responsive layout.
          </p>
        </Modal>
      )}
    </div>
  );
};
