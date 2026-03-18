import { ReactNode } from 'react';

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; isPositive: boolean };
}

export const KpiCard = ({ title, value, subtitle, icon, trend }: KpiCardProps) => {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-card border border-slate-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {trend.isPositive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
