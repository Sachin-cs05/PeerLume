import React, { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: 'default' | 'glass' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-card border border-border shadow-xs',
    glass: 'glass-panel shadow-glass',
    elevated: 'bg-surface-elevated border border-border shadow-md',
  };

  return (
    <div
      className={`text-foreground rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-200 border-t border-t-white/80 dark:border-t-white/10 ${variantStyles[variant]} ${
        hoverEffect
          ? 'hover:border-border-strong hover:bg-surface-hover/50 hover:-translate-y-1 hover:shadow-glow-sm cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
