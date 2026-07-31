import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Icon, type IconName } from '../Icon';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
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
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variants = {
      primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
      secondary: 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-active)]',
      outline: 'border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]',
      ghost: 'hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]',
      destructive: 'bg-[var(--color-error)] text-white hover:opacity-90',
      link: 'underline-offset-4 hover:underline text-[var(--color-primary)]',
    };

    const sizes = {
      xs: 'h-8 px-3 text-xs',
      sm: 'h-9 px-4',
      md: 'h-10 py-2 px-4',
      lg: 'h-11 px-8 text-base',
    };

    const isLink = variant === 'link';
    const activeSize = isLink ? '' : sizes[size];
    
    // Icon sizes mapping based on button size
    const iconSizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg'> = {
      xs: 'xs',
      sm: 'sm',
      md: 'sm',
      lg: 'md',
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
