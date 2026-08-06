import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { cn } from '../Button';
import { Icon } from '../Icon';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  id?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  searchable?: boolean | undefined;
  disabled?: boolean | undefined;
  onValueChange?: ((value: any) => void) | undefined;
  onChange?: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | undefined;
  options?: Array<{ label: string; value: string; disabled?: boolean }> | undefined;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      name,
      label,
      helperText,
      error,
      placeholder,
      required = false,
      searchable = false,
      className,
      children,
      value: propValue,
      defaultValue,
      disabled,
      onValueChange,
      onChange,
      options: propOptions,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // We need to track the internal value for the custom UI
    const [internalValue, setInternalValue] = useState<string | number | readonly string[] | undefined>(
      propValue !== undefined ? propValue : defaultValue
    );

    useEffect(() => {
      if (propValue !== undefined) {
        setInternalValue(propValue);
      }
    }, [propValue]);

    const selectRef = useRef<HTMLSelectElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge external ref with internal ref
    const handleRef = (node: HTMLSelectElement) => {
      selectRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
      }
    };

    // Parse children & propOptions to extract options
    const options: { value: string; label: ReactNode; disabled?: boolean }[] = [];
    if (propOptions) {
      propOptions.forEach(opt => options.push(opt));
    }
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const optionChild = child as ReactElement<any>;
        options.push({
          value: optionChild.props.value as string,
          label: optionChild.props.children,
          disabled: optionChild.props.disabled,
        });
      }
    });

    const selectedOption = options.find((opt) => opt.value === String(internalValue));
    const displayLabel = selectedOption ? selectedOption.label : (placeholder || 'Seleccionar...');

    const handleSelectOption = (optValue: string, optDisabled?: boolean) => {
      if (optDisabled || disabled) return;
      
      setInternalValue(optValue);
      onValueChange?.(optValue);
      setIsOpen(false);

      if (selectRef.current) {
        // Trigger React's onChange using native setter
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLSelectElement.prototype,
          'value'
        )?.set;
        
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(selectRef.current, optValue);
          const ev = new Event('change', { bubbles: true });
          selectRef.current.dispatchEvent(ev);
        } else {
          // Fallback if prototype setter is unavailable
          selectRef.current.value = optValue;
          const ev = new Event('change', { bubbles: true });
          selectRef.current.dispatchEvent(ev);
        }
      }
    };

    // Filter options if searchable
    const filteredOptions = searchable 
      ? options.filter(opt => {
          const labelText = typeof opt.label === 'string' ? opt.label : String(opt.label);
          return labelText.toLowerCase().includes(searchQuery.toLowerCase());
        })
      : options;

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          if (!isOpen) setSearchQuery(''); // clear search when closing
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)} ref={containerRef}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label} {required && <span className="text-error-500">*</span>}
          </label>
        )}
        
        {/* Hidden native select for form integration & react-hook-form */}
        <select
          id={id}
          name={name}
          ref={handleRef}
          required={required}
          disabled={disabled}
          value={internalValue}
          onChange={onChange}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className="sr-only" // Visually hidden but functional
          tabIndex={-1}
          {...props}
        >
          {children}
        </select>

        {/* Custom UI Trigger */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-lg border bg-background/50 backdrop-blur-sm px-4 py-2 text-sm text-text-primary transition-all shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isOpen ? 'border-primary-500 ring-1 ring-primary-500' : hasError ? 'border-error-500' : 'border-border-subtle hover:border-border-strong'
            )}
          >
            <span className={cn('truncate', !selectedOption && 'text-text-muted')}>
              {displayLabel}
            </span>
            <Icon 
              name="chevron-down" 
              size="sm" 
              className={cn('text-text-secondary transition-transform duration-200', isOpen && 'rotate-180')} 
            />
          </button>

          {/* Custom Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 mt-1 max-h-60 w-full flex flex-col rounded-lg border border-border-subtle bg-surface/80 dark:bg-surface/60 backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
              {searchable && (
                <div className="p-2 border-b border-border-subtle sticky top-0 bg-surface/90 dark:bg-surface-2/90 z-10 backdrop-blur-md">
                  <div className="relative">
                    <Icon name="search" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                    <input
                      type="text"
                      className="w-full bg-background/50 border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder:text-text-muted"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              <div className="overflow-auto p-1 max-h-[200px]">
                {filteredOptions.length === 0 ? (
                  <div className="p-2 text-sm text-text-muted text-center py-4">No hay resultados</div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === String(internalValue);
                  return (
                    <div
                      key={`${opt.value}-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectOption(opt.value, opt.disabled)}
                      className={cn(
                        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm outline-none transition-colors',
                        opt.disabled
                          ? 'pointer-events-none opacity-50'
                          : 'hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-900 dark:hover:text-primary-100',
                        isSelected && 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100 font-medium'
                      )}
                    >
                      <span className="truncate block w-full">{opt.label}</span>
                      {isSelected && (
                        <span className="absolute right-3 flex items-center justify-center">
                          <Icon name="check" size="sm" className="text-primary-600 dark:text-primary-400" />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            </div>
          )}
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
    );
  }
);

Select.displayName = 'Select';

