import React, { useRef, useEffect } from 'react';
import { cn } from '../Button';
import { SelectContext, useSelect } from './hooks/useSelect';
import { SelectTrigger } from './SelectTrigger';
import { SelectContent } from './SelectContent';
import { SelectSearch } from './SelectSearch';
import { SelectItemsList } from './SelectItemsList';
import type { SelectProps } from './Select.types';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const {
      id,
      name,
      label,
      helperText,
      error,
      required = false,
      disabled,
      className,
      children,
      onChange,
    } = props;

    const select = useSelect(props, ref, children);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          select.setIsOpen(false);
          if (!select.isOpen) select.setSearchQuery('');
        }
      };
      if (select.isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [select.isOpen, select]);

    const hasError = !!error;

    return (
      <SelectContext.Provider value={{ ...select, hasError, id, name, required, disabled, placeholder: props.placeholder, searchable: props.searchable ?? false }}>
        <div className={cn('flex flex-col gap-1.5 w-full', className)} ref={containerRef}>
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-text-primary">
              {label} {required && <span className="text-error-500">*</span>}
            </label>
          )}
          
          <select
            id={id}
            name={name}
            ref={select.handleRef}
            required={required}
            disabled={disabled}
            value={select.internalValue}
            onChange={onChange || (() => {})}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className="absolute opacity-0 w-0 h-0 -z-10 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          >
            {children}
          </select>

          <div className="relative">
            <SelectTrigger />
            <SelectContent>
              <SelectSearch />
              <SelectItemsList />
            </SelectContent>
          </div>

          {(helperText || error) && (
            <p
              id={hasError ? `${id}-error` : `${id}-helper`}
              className={cn('text-xs', hasError ? 'text-error-500' : 'text-text-secondary')}
            >
              {error || helperText}
            </p>
          )}
        </div>
      </SelectContext.Provider>
    );
  }
);

Select.displayName = 'Select';

