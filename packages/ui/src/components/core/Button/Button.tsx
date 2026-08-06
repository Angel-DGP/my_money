import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Icon, type IconName } from '../Icon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon' | undefined;
  type?: 'button' | 'submit' | 'reset' | undefined;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  fullWidth?: boolean | undefined;
  leftIcon?: IconName | undefined;
  rightIcon?: IconName | undefined;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md border border-transparent active:scale-95',
      secondary: 'bg-surface text-text-primary hover:bg-surface-hover border border-border-subtle shadow-sm hover:shadow-md active:scale-95',
      outline: 'border border-border-subtle hover:bg-primary-50/50 dark:hover:bg-primary-900/20 text-text-primary hover:text-primary-700 dark:hover:text-primary-300 hover:border-primary-300 dark:hover:border-primary-700 active:scale-95',
      ghost: 'border border-border-subtle/30 bg-transparent hover:bg-surface-hover/80 hover:border-border-subtle text-text-secondary hover:text-text-primary active:scale-95',
      destructive: 'bg-error-600 text-white hover:bg-error-700 hover:shadow-md border border-transparent active:scale-95',
      link: 'underline-offset-4 hover:underline text-primary-600',
    };

    const sizes = {
      xs: 'h-8 px-3 text-xs',
      sm: 'h-9 px-4',
      md: 'h-10 py-2 px-4',
      lg: 'h-11 px-8 text-base',
      icon: 'h-9 w-9 p-0 rounded-full flex items-center justify-center',
    };

    const isLink = variant === 'link';
    const activeSize = isLink ? '' : sizes[size];
    
    const iconSizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg'> = {
      xs: 'xs',
      sm: 'sm',
      md: 'sm',
      lg: 'md',
      icon: 'sm',
    };
    
    const activeIconSize = iconSizeMap[size] || 'sm';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          activeSize,
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="mr-2 animate-spin">
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        {!loading && leftIcon && (
          <span className="mr-2">
            <Icon name={leftIcon} size={activeIconSize} decorative />
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">
            <Icon name={rightIcon} size={activeIconSize} decorative />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

