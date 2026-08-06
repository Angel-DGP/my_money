import * as React from 'react';
import { cn } from '../../../utils/cn';

type TextVariant = 'body' | 'muted' | 'small' | 'xs' | 'error' | 'success';
type TextAlign = 'left' | 'center' | 'right';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant | undefined;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | string | undefined;
  align?: TextAlign | undefined;
  weight?: TextWeight | undefined;
  as?: React.ElementType | undefined;
}

const variantClasses: Record<TextVariant, string> = {
  body: 'text-base text-text-primary',
  muted: 'text-sm text-text-secondary',
  small: 'text-sm text-text-primary',
  xs: 'text-xs text-text-secondary',
  error: 'text-sm text-error-600 dark:text-error-400',
  success: 'text-sm text-success-600 dark:text-success-400',
};

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const weightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = 'body', align = 'left', weight = 'normal', as = 'p', className, children, ...props }, ref) => {
    const Component = as;

    return (
      <Component
        ref={ref as any}
        className={cn(variantClasses[variant], alignClasses[align], weightClasses[weight], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = 'Text';
