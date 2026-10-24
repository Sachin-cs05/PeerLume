import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = {
    info: {
      bg: 'bg-surface-hover/80 border-border text-foreground',
      icon: <Info className="w-4 h-4 text-foreground-secondary shrink-0 mt-0.5" />,
      titleColor: 'text-foreground',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
      titleColor: 'text-emerald-900 dark:text-emerald-100',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-900 dark:text-amber-100',
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
      titleColor: 'text-rose-900 dark:text-rose-100',
    },
  }[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm ${config.bg} ${className}`}
    >
      {config.icon}
      <div className="flex-1">
        {title && <h5 className={`font-semibold text-xs mb-0.5 ${config.titleColor}`}>{title}</h5>}
        <div className="leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
