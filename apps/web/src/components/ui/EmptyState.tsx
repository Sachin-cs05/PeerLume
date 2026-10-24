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
      className={`rounded-xl border border-border bg-card p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-xs ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-hover border border-border text-foreground flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed max-w-sm mx-auto">
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
