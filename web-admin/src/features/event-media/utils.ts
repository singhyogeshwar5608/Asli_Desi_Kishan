export const formatBytes = (bytes?: number | null) => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[index]}`;
};

export const formatDuration = (value?: number | null) => {
  if (value === undefined || value === null) return null;
  const total = Math.round(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export const formatDateLabel = (value?: string | null) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return value;
  }
};
