import * as React from 'react';
import { Input, type InputProps } from '../../core/Input';
import { useUIConfig } from '../../../providers/ConfigProvider';
import { cn } from '../../../utils/cn';

export interface MoneyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  format?: 'currency' | 'decimal' | 'percent';
  currency?: string;
  locale?: string;
  precision?: number;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      className,
      value,
      onValueChange,
      format = 'currency',
      currency: propCurrency,
      locale: propLocale,
      precision = 2,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const config = useUIConfig();
    const currency = propCurrency || config.currency;
    const locale = propLocale || config.locale;

    const [internalValue, setInternalValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Format a number to string
    const formatNumber = React.useCallback(
      (val: number | null | undefined): string => {
        if (val === null || val === undefined) return '';

        const formatter = new Intl.NumberFormat(locale, {
          style: format === 'percent' ? 'percent' : format === 'currency' ? 'currency' : 'decimal',
          currency: format === 'currency' ? currency : undefined,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        });

        return formatter.format(format === 'percent' ? val / 100 : val);
      },
      [locale, format, currency, precision]
    );

    // Parse a string to number flexibly (handles both '.' and ',' decimals)
    const parseNumber = React.useCallback(
      (text: string): number | null => {
        if (!text.trim()) return null;

        let clean = text.trim();
        const isNegative = clean.startsWith('-');

        // Remove everything except digits, dots, and commas
        clean = clean.replace(/[^0-9.,]/g, '');
        if (!clean) return null;

        // Determine if dot or comma is the decimal separator:
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');

        if (lastDot !== -1 && lastComma !== -1) {
          if (lastDot > lastComma) {
            // E.g. "1,234.56" -> remove commas
            clean = clean.replace(/,/g, '');
          } else {
            // E.g. "1.234,56" -> remove dots, replace comma with dot
            clean = clean.replace(/\./g, '').replace(',', '.');
          }
        } else if (lastComma !== -1) {
          // Only comma exists (e.g. "50,5")
          clean = clean.replace(',', '.');
        }

        const parsed = parseFloat(clean);
        if (isNaN(parsed)) return null;

        return isNegative ? -parsed : parsed;
      },
      []
    );

    // Sync external value to internal string when not focused
    React.useEffect(() => {
      if (!isFocused) {
        setInternalValue(formatNumber(value));
      }
    }, [value, isFocused, formatNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      
      const parsed = parseNumber(newValue);
      onValueChange?.(parsed);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // On blur, reformat the internal value beautifully
      const parsed = parseNumber(internalValue);
      setInternalValue(formatNumber(parsed));
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // On focus, you might want to show the raw number without currency symbols 
      // to make it easier to edit, but for simplicity, we let them edit the formatted string.
      // A common pattern is to just strip the currency symbol on focus:
      if (value !== null && value !== undefined) {
        const rawFormatter = new Intl.NumberFormat(locale, {
          style: 'decimal',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        });
        setInternalValue(rawFormatter.format(value));
      }
      onFocus?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn('text-right tabular-nums', className)}
        {...props}
      />
    );
  }
);
MoneyInput.displayName = 'MoneyInput';
