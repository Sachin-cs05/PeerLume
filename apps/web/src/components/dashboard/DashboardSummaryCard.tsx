import React from 'react';

interface DashboardSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: React.ReactNode;
}

export const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-border-strong transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-surface-hover text-foreground border border-border">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2.5">
        <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-hover text-foreground border border-border">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-foreground-muted leading-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
};
