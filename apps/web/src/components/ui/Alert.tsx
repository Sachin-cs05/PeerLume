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
      bg: 'bg-brand-500/10 border-brand-500/25 text-brand-200',
      icon: <Info className="w-5 h-5 text-brand-400 shrink-0" />,
      titleColor: 'text-brand-300',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-300',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/25 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      titleColor: 'text-amber-300',
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/25 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      titleColor: 'text-rose-300',
    },
  }[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3.5 rounded-xl border p-4 backdrop-blur-sm ${config.bg} ${className}`}
    >
      {config.icon}
      <div className="flex-1 text-sm">
        {title && <h5 className={`font-semibold mb-0.5 ${config.titleColor}`}>{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
