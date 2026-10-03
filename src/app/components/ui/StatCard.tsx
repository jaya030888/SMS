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
    primary: 'bg-teal-50 text-teal-600 border-teal-100/80 group-hover:scale-110 group-hover:border-teal-400/40 group-hover:shadow-[0_0_14px_rgba(20,184,166,0.25)]',
    default: 'bg-slate-100 text-slate-700 border-slate-200 group-hover:scale-110',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-110 group-hover:border-emerald-300 group-hover:shadow-[0_0_14px_rgba(34,197,94,0.2)]',
    warning: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:scale-110 group-hover:border-amber-300 group-hover:shadow-[0_0_14px_rgba(245,158,11,0.2)]',
    info: 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:scale-110 group-hover:border-cyan-300 group-hover:shadow-[0_0_14px_rgba(52,183,222,0.25)]',
    danger: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:scale-110 group-hover:border-rose-300',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-teal-500/50 hover:shadow-sm transition-all group">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
          {displayLabel}
        </span>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 transition-all ${iconVariants[variant]}`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-2 sm:mt-3">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
          )}
          {displayDesc && (
            <span className="text-[11px] text-slate-500 font-medium truncate">
              {displayDesc}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
