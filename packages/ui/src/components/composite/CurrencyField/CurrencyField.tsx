import * as React from 'react';
import { MoneyInput, type MoneyInputProps } from '../MoneyInput';
import { Label } from '../../core/Label';
import { cn } from '../../../utils/cn';

export interface CurrencyFieldProps extends MoneyInputProps {
  /** Label text for the field */
  label: string;
  /** Detailed description below the label */
  description?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input. Replaces helperText if present */
  error?: string;
  /** Wrapper class name */
  wrapperClassName?: string;
}

export const CurrencyField = React.forwardRef<HTMLInputElement, CurrencyFieldProps>(
  (
    {
      label,
      description,
      helperText,
      error,
      wrapperClassName,
      id,
      className,
      ...props
    },
    ref
  ) => {
    // Generate an ID for the input if one isn't provided, 
    // to link the label and input for accessibility.
    const generatedId = React.useId();
    const inputId = id || generatedId;
    
    // IDs for ARIA attributes
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        <Label htmlFor={inputId} className="font-semibold text-text-primary">
          {label}
        </Label>
        
        {description && (
          <p id={descriptionId} className="text-sm text-text-secondary">
            {description}
          </p>
        )}
        
        <MoneyInput
          ref={ref}
          id={inputId}
          className={cn(error && 'border-error-500 focus-visible:ring-error-500', className)}
          aria-invalid={!!error}
          aria-describedby={
            [
              description ? descriptionId : undefined,
              error ? errorId : undefined,
              !error && helperText ? helperId : undefined,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...props}
        />
        
        {error ? (
          <p id={errorId} className="text-sm text-error-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
CurrencyField.displayName = 'CurrencyField';
