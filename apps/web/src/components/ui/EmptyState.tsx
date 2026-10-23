import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button.js';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-sm ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-500 dark:text-brand-400 flex items-center justify-center shadow-inner">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {action && (
        <div className="pt-2">
          {action.href ? (
            <Link to={action.href}>
              <Button
                variant={action.variant || 'primary'}
                size="sm"
                leftIcon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              leftIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
