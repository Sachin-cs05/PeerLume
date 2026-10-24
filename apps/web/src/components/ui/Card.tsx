import React, { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-card text-foreground border border-border rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-150 ${
        hoverEffect
          ? 'hover:border-border-strong hover:bg-surface-hover/40 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
