import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    brand:
      'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-800 dark:border-neutral-200',
    neutral:
      'bg-surface-hover text-foreground border-border',
    outline:
      'bg-transparent text-foreground border-border',
    success:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    warning:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    danger:
      'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  };

  const dotColors = {
    brand: 'bg-white dark:bg-neutral-900',
    neutral: 'bg-foreground-muted',
    outline: 'bg-foreground-muted',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
