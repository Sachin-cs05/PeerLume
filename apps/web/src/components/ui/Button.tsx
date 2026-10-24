import React, { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  const variantStyles = {
    // Light Mode: Black bg (#111113) with White text. Dark Mode: White bg (#FFFFFF) with Deep Black text (#09090B)
    primary:
      'bg-[#111113] hover:bg-[#27272A] active:bg-[#000000] text-white dark:bg-white dark:hover:bg-[#E4E4E7] dark:active:bg-[#D4D4D8] dark:text-[#09090B] font-semibold shadow-xs',
    // Secondary: Transparent background with border, Near Black text in light mode, Pure White text in dark mode
    secondary:
      'bg-transparent hover:bg-surface-hover active:bg-surface-hover/80 text-foreground border border-border hover:border-border-strong font-medium',
    // Outline: Clean subtle border, text-foreground
    outline:
      'bg-transparent hover:bg-surface-hover text-foreground border border-border hover:border-foreground/40 font-medium',
    // Ghost: Clean hover surface
    ghost:
      'bg-transparent hover:bg-surface-hover text-foreground-secondary hover:text-foreground font-medium',
    // Danger: Restrained semantic red
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
