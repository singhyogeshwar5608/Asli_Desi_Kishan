import { Check, Edit, Eye, ImageIcon, Link2, Trash2, Video } from 'lucide-react';
import type { EventMediaItem } from '../types';
import { formatBytes, formatDateLabel, formatDuration } from '../utils';

interface MediaCardProps {
  item: EventMediaItem;
  selected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onEdit?: (item: EventMediaItem) => void;
  onDelete?: (item: EventMediaItem) => void;
  onPreview?: (item: EventMediaItem) => void;
  onToggleStatus?: (item: EventMediaItem) => void;
  onOpenLink?: (item: EventMediaItem) => void;
}

export const MediaCard = ({
  item,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onPreview,
  onToggleStatus,
  onOpenLink,
}: MediaCardProps) => {
  const durationLabel = formatDuration(item.durationSeconds ?? undefined);
  const toggleSelect = () => onSelect?.(item.id, !selected);

  return (
    <div className={`rounded-3xl border bg-white/95 shadow-card-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900/80 ${selected ? 'border-primary/60 ring-2 ring-primary/30' : 'border-slate-100 dark:border-white/10'}`}>
      <div className="relative">
        <div className="h-44 w-full overflow-hidden rounded-3xl rounded-b-none bg-slate-100 dark:bg-white/10">
          {item.mediaType === 'IMAGE' ? (
            <img src={item.thumbnailUrl ?? item.fileUrl} className="h-full w-full object-cover" />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-slate-900 text-white">
              <Video className="h-10 w-10 text-white/80" />
              {item.thumbnailUrl && <img src={item.thumbnailUrl} className="absolute inset-0 h-full w-full object-cover opacity-70" />}
              {durationLabel && <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold">{durationLabel}</span>}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSelect}
          className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border ${
            selected ? 'border-primary bg-primary text-white' : 'border-white/70 bg-white/90 text-slate-600'
          }`}
        >
          {selected ? <Check className="h-4 w-4" /> : <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />}
        </button>
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {item.mediaType === 'IMAGE' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
          <span>{item.mediaType}</span>
        </div>
        <button type="button" onClick={() => onPreview?.(item)} className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
          Preview
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => onToggleStatus?.(item)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <p className="font-semibold text-slate-400">Uploaded</p>
            <p className="text-sm text-slate-800 dark:text-white">{formatDateLabel(item.uploadedAt)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400">File size</p>
            <p className="text-sm text-slate-800 dark:text-white">{formatBytes(item.fileSizeBytes ?? undefined)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400">MIME type</p>
            <p className="text-sm text-slate-800 dark:text-white">{item.mimeType ?? '—'}</p>
          </div>
          {durationLabel && (
            <div>
              <p className="font-semibold text-slate-400">Duration</p>
              <p className="text-sm text-slate-800 dark:text-white">{durationLabel}</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onPreview?.(item)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-slate-400"
          >
            <Eye className="h-3.5 w-3.5" /> View
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-primary hover:text-primary"
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(item)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1.5 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button
            type="button"
            onClick={() => onOpenLink?.(item)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-slate-400"
          >
            <Link2 className="h-3.5 w-3.5" /> Copy link
          </button>
        </div>
      </div>
    </div>
  );
};
