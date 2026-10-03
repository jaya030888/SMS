// src/app/components/ui/ChartCard.tsx
import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-teal-500/50 hover:shadow-sm transition-all group ${className}`}>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-150/80">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
};

export default ChartCard;
