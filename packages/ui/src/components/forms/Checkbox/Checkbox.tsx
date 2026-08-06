import React from 'react';
import { Icon } from '../../core/Icon';
import { cn } from '../../../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, label, description, disabled, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-3 cursor-pointer group min-h-10", className)}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            checked={checked}
            onChange={(e) => {
              onCheckedChange?.(e.target.checked);
              props.onChange?.(e);
            }}
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-md border flex items-center justify-center transition-colors shadow-sm",
              "border-border-subtle bg-surface",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 peer-focus-visible:border-primary-500",
              "peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-checked:dark:bg-primary-500 peer-checked:dark:border-primary-500",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "text-transparent peer-checked:text-white"
            )}
          >
            <Icon name="check" size="xs" />
          </div>
        </div>
        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <span
                className={cn(
                  "text-sm font-medium leading-none",
                  disabled ? "cursor-not-allowed opacity-70" : "",
                  "text-text-primary group-hover:text-primary-600 transition-colors"
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

