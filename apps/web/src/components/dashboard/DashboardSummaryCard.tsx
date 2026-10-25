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
    <div className="group relative overflow-hidden bg-card border border-border rounded-xl sm:rounded-2xl p-5 shadow-xs hover:shadow-glow-sm hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between gap-3 border-t border-t-white/80 dark:border-t-white/10">
      {/* Subtle background ambient glow on hover */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 blur-xl transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider group-hover:text-foreground transition-colors">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-surface-hover text-foreground border border-border group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2.5 relative z-10">
        <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-150">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-foreground-muted leading-tight relative z-10">
          {subtitle}
        </p>
      )}
    </div>
  );
};
