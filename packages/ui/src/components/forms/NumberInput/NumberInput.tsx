import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../core/Icon';
import { Label } from '../../core/Label';
import type { NumberInputProps } from './NumberInput.types';

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      id,
      name,
      label,
      helperText,
      error,
      value: controlledValue,
      defaultValue,
      onChange,
      onValueChange,
      min,
      max,
      step = 1,
      prefix,
      suffix,
      disabled = false,
      readOnly = false,
      required = false,
      placeholder,
      className,
      showSteppers = true,
      ...restProps
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue);
      return '';
    });

    const displayValue = isControlled
      ? controlledValue !== undefined && controlledValue !== null
        ? String(controlledValue)
        : ''
      : internalValue;

    useEffect(() => {
      if (isControlled) {
        setInternalValue(
          controlledValue !== undefined && controlledValue !== null ? String(controlledValue) : ''
        );
      }
    }, [isControlled, controlledValue]);

    const notifyChange = (valStr: string) => {
      const numVal = valStr === '' || isNaN(Number(valStr)) ? undefined : Number(valStr);
      if (!isControlled) {
        setInternalValue(valStr);
      }
      onChange?.(numVal);
      onValueChange?.(numVal);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      // Allow empty, minus sign, digits, and single decimal point
      if (rawVal === '' || /^-?\d*\.?\d*$/.test(rawVal)) {
        notifyChange(rawVal);
      }
    };

    const handleIncrement = () => {
      if (disabled || readOnly) return;
      const current = parseFloat(displayValue) || 0;
      let next = current + step;
      if (max !== undefined && next > max) next = max;
      notifyChange(String(Number(next.toFixed(4))));
    };

    const handleDecrement = () => {
      if (disabled || readOnly) return;
      const current = parseFloat(displayValue) || 0;
      let next = current - step;
      if (min !== undefined && next < min) next = min;
      notifyChange(String(Number(next.toFixed(4))));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      }
    };

    const hasError = !!error;

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}

        <div
          className={cn(
            'group relative flex h-10 min-h-10 items-center w-full rounded-lg border shadow-sm transition-all overflow-hidden',
            'bg-background/50 backdrop-blur-sm border-border-subtle text-text-primary',
            'focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500',
            !disabled && !hasError && 'hover:border-border-strong',
            hasError && 'border-error-500 focus-within:ring-error-500 focus-within:border-error-500',
            disabled && 'opacity-50 bg-surface-2 cursor-not-allowed'
          )}
        >
          {prefix && (
            <span className="pl-3 pr-1 text-sm font-semibold text-text-muted select-none">
              {prefix}
            </span>
          )}

          <input
            {...restProps}
            ref={ref}
            id={id}
            name={name}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full h-full bg-transparent px-3 text-sm text-text-primary placeholder:text-text-muted outline-none font-medium',
              // Hide browser default spinners
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />

          {suffix && (
            <span className="px-2 text-xs font-medium text-text-muted select-none">
              {suffix}
            </span>
          )}

          {showSteppers && !disabled && !readOnly && (
            <div className="flex items-center gap-1 pr-1.5 shrink-0 select-none">
              <button
                type="button"
                tabIndex={-1}
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 active:bg-surface-3 active:scale-95 transition-all"
                aria-label="Decrementar"
              >
                <Icon name="minus" size="xs" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 active:bg-surface-3 active:scale-95 transition-all"
                aria-label="Incrementar"
              >
                <Icon name="plus" size="xs" />
              </button>
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p className={cn('text-xs', hasError ? 'text-error-500 font-medium' : 'text-text-muted')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
