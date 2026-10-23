import React from 'react';

interface DashboardSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
}

export const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-brand-500/10 border-brand-500/20',
  iconTextColor = 'text-brand-400',
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-start justify-between gap-4 hover:border-slate-700 transition-all">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`p-3 rounded-2xl border ${iconBgColor} ${iconTextColor} shrink-0`}>
        {icon}
      </div>
    </div>
  );
};
