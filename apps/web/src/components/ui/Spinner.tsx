import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className={`inline-flex items-center gap-2 text-foreground ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-current`} />
      {label && <span className="text-xs sm:text-sm font-medium text-foreground-secondary">{label}</span>}
    </div>
  );
};
