import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../core/Icon';
import { Label } from '../../core/Label';
import type { DatePickerProps } from './DatePicker.types';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

function parseDate(val?: string | Date | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const parts = val.split('T')[0]?.split('-');
  if (!parts || parts.length !== 3) return null;
  const year = parseInt(parts[0] || '0', 10);
  const month = parseInt(parts[1] || '0', 10) - 1;
  const day = parseInt(parts[2] || '0', 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
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
      min,
      max,
      disabled = false,
      readOnly = false,
      required = false,
      placeholder = 'DD/MM/AAAA',
      className,
      showPresets = true,
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const initialDate = useMemo(() => {
      const initial = parseDate(isControlled ? controlledValue : defaultValue);
      return initial || new Date();
    }, [isControlled, controlledValue, defaultValue]);

    const [viewDate, setViewDate] = useState<Date>(initialDate);
    const [internalValue, setInternalValue] = useState<string>(() => {
      const parsed = parseDate(defaultValue);
      return parsed ? formatDateISO(parsed) : '';
    });

    const selectedDate = useMemo(() => {
      const dateVal = isControlled ? controlledValue : internalValue;
      return parseDate(dateVal);
    }, [isControlled, controlledValue, internalValue]);

    // Keep view date synced with selected date when opened
    useEffect(() => {
      if (selectedDate) {
        setViewDate(new Date(selectedDate));
      }
    }, [isOpen, selectedDate]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleSelectDate = (date: Date) => {
      if (disabled || readOnly) return;
      const isoStr = formatDateISO(date);
      if (!isControlled) {
        setInternalValue(isoStr);
      }
      onChange?.(isoStr);
      setIsOpen(false);
    };

    const handleClear = () => {
      if (disabled || readOnly) return;
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      setIsOpen(false);
    };

    const handleToday = () => {
      handleSelectDate(new Date());
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Build calendar grid
    const calendarDays = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      // Monday-first index: 0 = Mon, 6 = Sun
      let firstDayIndex = firstDayOfMonth.getDay() - 1;
      if (firstDayIndex === -1) firstDayIndex = 6;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const days: Array<{
        date: Date;
        isCurrentMonth: boolean;
        isToday: boolean;
        isSelected: boolean;
        isDisabled: boolean;
      }> = [];

      const today = new Date();
      const minDate = parseDate(min);
      const maxDate = parseDate(max);

      // Prev month trailing days
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        days.push({
          date: d,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isDisabled: true,
        });
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const isToday =
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear();
        const isSelected =
          !!selectedDate &&
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear();

        let isDisabled = false;
        if (minDate && d < minDate) isDisabled = true;
        if (maxDate && d > maxDate) isDisabled = true;

        days.push({
          date: d,
          isCurrentMonth: true,
          isToday,
          isSelected,
          isDisabled,
        });
      }

      // Next month leading days (to fill 42 cells total)
      const remainingCells = 42 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
          date: d,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isDisabled: true,
        });
      }

      return days;
    }, [viewDate, selectedDate, min, max]);

    const hasError = !!error;
    const currentISO = selectedDate ? formatDateISO(selectedDate) : '';

    return (
      <div className={cn('flex flex-col gap-1.5 w-full relative', className)} ref={containerRef}>
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}

        {/* Hidden input for HTML form submission */}
        <input
          ref={ref}
          type="hidden"
          id={id}
          name={name}
          value={currentISO}
          required={required}
        />

        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !readOnly && setIsOpen((prev) => !prev)}
          className={cn(
            'flex h-10 min-h-10 w-full items-center justify-between rounded-lg border bg-background/50 backdrop-blur-sm px-3 text-sm text-text-primary transition-all shadow-sm',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:border-primary-500',
            hasError
              ? 'border-error-500 ring-1 ring-error-500'
              : isOpen
              ? 'border-primary-500 ring-1 ring-primary-500'
              : 'border-border-subtle hover:border-border-strong',
            disabled && 'opacity-50 bg-surface-2 cursor-not-allowed',
            readOnly && 'cursor-default'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="calendar" size="xs" className="text-text-muted shrink-0" />
            <span className={cn('truncate', !selectedDate && 'text-text-muted')}>
              {selectedDate ? formatDateDisplay(selectedDate) : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 text-text-muted shrink-0">
            {selectedDate && !disabled && !readOnly && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-0.5 hover:text-text-primary rounded hover:bg-surface-2 transition-colors cursor-pointer text-xs leading-none"
                title="Limpiar fecha"
              >
                ✕
              </span>
            )}
            <Icon
              name="chevron-down"
              size="xs"
              className={cn('text-text-secondary transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </div>
        </button>

        {/* Dropdown Floating Calendar */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-76 z-50 rounded-xl border border-border-subtle bg-surface shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Month / Year Navigation */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
              <span className="font-bold text-sm text-text-primary capitalize">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                  aria-label="Mes anterior"
                >
                  <Icon name="chevron-left" size="xs" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                  aria-label="Mes siguiente"
                >
                  <Icon name="chevron-right" size="xs" />
                </button>
              </div>
            </div>

            {/* Day Names Row */}
            <div className="grid grid-cols-7 gap-1 pt-2.5 pb-1 text-center">
              {DAY_NAMES.map((name) => (
                <span key={name} className="text-[11px] font-bold text-text-muted uppercase">
                  {name}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {calendarDays.map((item, idx) => {
                const dayNum = item.date.getDate();
                return (
                  <button
                    key={`${item.date.toISOString()}-${idx}`}
                    type="button"
                    disabled={item.isDisabled}
                    onClick={() => handleSelectDate(item.date)}
                    className={cn(
                      'h-7.5 w-7.5 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-150',
                      !item.isCurrentMonth && 'text-text-muted/30 pointer-events-none',
                      item.isCurrentMonth && !item.isSelected && 'text-text-primary hover:bg-surface-2 active:scale-95',
                      item.isSelected && 'bg-primary-500 text-white font-bold shadow-sm scale-105',
                      item.isToday && !item.isSelected && 'ring-1 ring-primary-500 font-bold text-primary-500',
                      item.isDisabled && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Presets & Actions Footer */}
            {showPresets && (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-text-muted hover:text-error-500 font-medium transition-colors"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-semibold transition-colors"
                >
                  Hoy
                </button>
              </div>
            )}
          </div>
        )}

        {(helperText || error) && (
          <p className={cn('text-xs', hasError ? 'text-error-500 font-medium' : 'text-text-muted')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
