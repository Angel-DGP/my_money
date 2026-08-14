import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import type { SwitchProps } from './Switch.types';

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      id,
      name,
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      disabled = false,
      label,
      description,
      size = 'md',
      className,
    },
    ref
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    const isChecked = isControlled ? controlledChecked : internalChecked;

    useEffect(() => {
      if (isControlled) {
        setInternalChecked(controlledChecked);
      }
    }, [isControlled, controlledChecked]);

    const handleToggle = () => {
      if (disabled) return;
      const nextChecked = !isChecked;
      if (!isControlled) {
        setInternalChecked(nextChecked);
      }
      onChange?.(nextChecked);
    };

    const sizeClasses = {
      sm: {
        track: 'w-8 h-4.5 p-0.5',
        thumb: 'w-3.5 h-3.5',
        translate: 'translate-x-3.5',
      },
      md: {
        track: 'w-11 h-6 p-0.5',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-7.5 p-1',
        thumb: 'w-5.5 h-5.5',
        translate: 'translate-x-6.5',
      },
    }[size];

    return (
      <div className={cn('flex items-start justify-between gap-4 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
        {(label || description) && (
          <div className="flex flex-col flex-1" onClick={handleToggle}>
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-semibold text-text-primary cursor-pointer leading-snug"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-text-muted mt-0.5 leading-normal">{description}</p>
            )}
          </div>
        )}

        <button
          type="button"
          role="switch"
          id={id}
          aria-checked={isChecked}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleToggle();
            }
          }}
          className={cn(
            'relative inline-flex shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            sizeClasses.track,
            isChecked
              ? 'bg-primary-500 shadow-sm'
              : 'bg-neutral-300 dark:bg-surface-3 hover:bg-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out',
              sizeClasses.thumb,
              isChecked ? sizeClasses.translate : 'translate-x-0'
            )}
          />
        </button>

        {/* Hidden checkbox for form serialization */}
        <input
          type="checkbox"
          ref={ref}
          name={name}
          checked={isChecked}
          onChange={(e) => {
            const val = e.target.checked;
            if (!isControlled) setInternalChecked(val);
            onChange?.(val);
          }}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    );
  }
);

Switch.displayName = 'Switch';
