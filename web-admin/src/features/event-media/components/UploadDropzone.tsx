import { useId, useRef, useState } from 'react';
import { Film, ImageIcon, UploadCloud } from 'lucide-react';

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string[];
  maxSizeMB?: number;
  isUploading?: boolean;
  helperText?: string;
}

const defaultAccept = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

export const UploadDropzone = ({
  onFiles,
  accept = defaultAccept,
  maxSizeMB = 25,
  isUploading = false,
  helperText,
}: UploadDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropzoneId = useId();
  const [isDragActive, setDragActive] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    onFiles(files);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDragActive) setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const acceptAttr = accept.join(',');

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-slate-950/60 p-6">
      <label
        htmlFor={dropzoneId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-slate-300 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
        } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-center gap-3 text-primary">
          <UploadCloud className="h-10 w-10" />
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            <ImageIcon className="h-4 w-4" />
            <span>+</span>
            <Film className="h-4 w-4" />
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Drag & drop files here</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supported formats: {accept.map((type) => type.split('/')[1]?.toUpperCase() ?? type).join(', ')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Max size {maxSizeMB} MB per file</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl bg-primary/90 px-5 py-2.5 text-sm font-semibold text-white shadow-card"
          >
            {isUploading ? 'Uploading…' : 'Select files'}
          </button>
          {helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
        </div>
        <input
          id={dropzoneId}
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptAttr}
          multiple
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
