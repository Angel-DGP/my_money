import React, { useId } from 'react';
import { cn } from '../Button';
import { Icon, type IconName } from '../Icon';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: providedId,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label} {props.required && <span className="text-error-500">*</span>}
          </label>
        )}
        
        <div
          className={cn(
            'group relative flex items-center w-full min-h-10 rounded-lg border shadow-sm transition-all overflow-hidden',
            // Default colors
            'bg-background/50 backdrop-blur-sm border-border-subtle text-text-primary',
            // Focus within (replaces focus-visible on the native input)
            'focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500',
            // Hover (only when not focused, not error, not disabled)
            !disabled && !hasError && 'hover:border-border-strong',
            // Disabled
            disabled && 'opacity-50 cursor-not-allowed bg-surface-2',
            // Error
            hasError && 'border-error-500 focus-within:ring-error-500 focus-within:border-error-500'
          )}
        >
          {/* Left Slot */}
          {(leftIcon || prefix) && (
            <div className="flex items-center justify-center pl-4 pr-2 text-text-secondary z-10 shrink-0">
              {leftIcon ? <Icon name={leftIcon} size="sm" decorative /> : prefix}
            </div>
          )}

          {/* Native Input */}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={cn(
              'flex-1 w-full bg-transparent px-4 py-2 text-sm outline-none placeholder:text-text-muted',
              'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              (leftIcon || prefix) && 'pl-2',
              (rightIcon || suffix) && 'pr-2'
            )}
            {...props}
          />

          {/* Right Slot */}
          {(rightIcon || suffix) && (
            <div className="flex items-center justify-center pr-4 pl-2 text-text-secondary z-10 shrink-0">
              {rightIcon ? <Icon name={rightIcon} size="sm" decorative /> : suffix}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {(helperText || error) && (
          <p
            id={hasError ? `${id}-error` : `${id}-helper`}
            className={cn('text-xs', hasError ? 'text-error-500' : 'text-text-secondary')}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
