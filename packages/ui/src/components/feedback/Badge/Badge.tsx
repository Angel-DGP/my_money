import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

export interface BadgeProps {
  variant?: 'primary' | 'neutral' | 'secondary' | 'success' | 'warning' | 'error' | undefined;
  size?: 'sm' | 'md' | undefined;
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100',
  neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100',
  secondary: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100',
  success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100',
  error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = ({
  variant = 'neutral',
  size = 'md',
  children,
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-lg',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};
