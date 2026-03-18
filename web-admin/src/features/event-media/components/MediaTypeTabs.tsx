import { Film, ImageIcon, Sparkles } from 'lucide-react';
import type { MediaTypeFilter } from '../types';

interface MediaTypeTabsProps {
  value: MediaTypeFilter;
  onChange: (value: MediaTypeFilter) => void;
  counts?: Partial<Record<MediaTypeFilter, number>>;
}

const defaultTabs: Array<{ value: MediaTypeFilter; label: string; icon: React.ComponentType<any> }> = [
  { value: 'ALL', label: 'All media', icon: Sparkles },
  { value: 'IMAGE', label: 'Images', icon: ImageIcon },
  { value: 'VIDEO', label: 'Videos', icon: Film },
];

export const MediaTypeTabs = ({ value, onChange, counts }: MediaTypeTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {defaultTabs.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.value;
        const count = counts?.[tab.value];
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {typeof count === 'number' && (
              <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-200">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
