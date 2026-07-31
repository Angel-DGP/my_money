import React, { ReactNode } from 'react';
import { cn } from '../../../utils/cn';

export interface BadgeProps {
  variant?: 'primary' | 'neutral' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
  neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
  success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
  error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
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
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};
