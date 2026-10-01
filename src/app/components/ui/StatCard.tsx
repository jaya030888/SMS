// src/app/components/ui/StatCard.tsx
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  title,
  value,
  icon: Icon,
  description,
  subtitle,
  trend,
  variant = 'primary',
}) => {
  const displayLabel = label || title || '';
  const displayDesc = description || subtitle;

  const iconVariants: Record<string, string> = {
    primary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    info: 'bg-sky-50 text-sky-600 border-sky-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
          {displayLabel}
        </span>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 ${iconVariants[variant]}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          {value}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
          )}
          {displayDesc && (
            <span className="text-xs text-slate-500 font-medium truncate">
              {displayDesc}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
