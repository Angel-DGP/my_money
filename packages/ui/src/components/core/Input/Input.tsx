import React from 'react';
import { cn } from '../Button'; // Reuse the cn utility
import { Icon, type IconName } from '../Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  type?: React.HTMLInputTypeAttribute;
  leftIcon?: IconName;
  rightIcon?: IconName;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      label,
      placeholder,
      helperText,
      error,
      required = false,
      disabled = false,
      readOnly = false,
      autoComplete,
      type = 'text',
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label} {required && <span className="text-[var(--color-error)]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
              <Icon name={leftIcon} size="sm" decorative />
            </div>
          )}
          <input
            id={id}
            name={name}
            ref={ref}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            className={cn(
              'flex h-10 w-full rounded-md border bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-[var(--color-text-secondary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError
                ? 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]'
                : 'border-[var(--color-border)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
              <Icon name={rightIcon} size="sm" decorative />
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p
            id={hasError ? `${id}-error` : `${id}-helper`}
            className={cn(
              'text-xs',
              hasError ? 'text-[var(--color-error)]' : 'text-[var(--color-text-secondary)]'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
