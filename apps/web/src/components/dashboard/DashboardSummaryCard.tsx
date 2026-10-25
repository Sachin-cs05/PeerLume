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
    <div className="group bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-border-strong transition-all duration-200 flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground-secondary uppercase tracking-wider group-hover:text-foreground transition-colors">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-surface-hover text-foreground border border-border group-hover:scale-105 group-hover:border-foreground/30 transition-all duration-200">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2.5">
        <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-hover text-foreground border border-border group-hover:scale-105 transition-transform duration-150">
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
