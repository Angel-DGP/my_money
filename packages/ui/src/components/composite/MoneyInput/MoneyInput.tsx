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

    // Get localized separators
    const { decimalSeparator, groupSeparator } = React.useMemo(() => {
      const parts = new Intl.NumberFormat(locale).formatToParts(1111.1);
      return {
        decimalSeparator: parts.find((p) => p.type === 'decimal')?.value || '.',
        groupSeparator: parts.find((p) => p.type === 'group')?.value || ',',
      };
    }, [locale]);

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

    // Parse a string to number
    const parseNumber = React.useCallback(
      (text: string): number | null => {
        if (!text.trim()) return null;

        // Strip everything except digits, decimal separator, and minus sign
        // But first, escape separators for regex
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const dec = escapeRegex(decimalSeparator);
        
        let cleanText = text;
        // Remove group separators completely
        cleanText = cleanText.split(groupSeparator).join('');
        
        // Remove all chars except numbers, the decimal separator, and minus sign
        const validCharsRegex = new RegExp(`[^0-9\\-${dec}]`, 'g');
        cleanText = cleanText.replace(validCharsRegex, '');
        
        // Replace localized decimal separator with standard '.'
        cleanText = cleanText.replace(decimalSeparator, '.');

        const parsed = parseFloat(cleanText);
        
        if (isNaN(parsed)) return null;
        
        // If percent, user types "50", it means 50%. But our internal value is 50. 
        // Wait, if format is percent, and user types 50%, we parse 50.
        // Actually, if we want `value` to be the raw number, for percent, is value 0.5 or 50?
        // Let's assume `value` is 50 for 50%. The formatNumber divides by 100.
        // Wait, Intl.NumberFormat percent expects 0.5 for 50%.
        // So if user types 50, parseNumber should return 50 if we don't divide, but formatNumber divides.
        // To be consistent: value=50 means 50%.
        return parsed;
      },
      [decimalSeparator, groupSeparator]
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
