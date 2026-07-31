import * as React from 'react';
import { cn } from '../../../utils/cn';
import { useUIConfig } from '../../../providers/ConfigProvider';

export interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The numeric value to format */
  value: number;
  /** ISO 4217 currency code. Defaults to ConfigProvider.currency */
  currency?: string;
  /** BCP 47 language tag. Defaults to ConfigProvider.locale */
  locale?: string;
  /** Visual semantic variant */
  variant?: 'neutral' | 'income' | 'expense';
  /** Text size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** How to display the sign */
  signDisplay?: 'auto' | 'always' | 'never';
}

const variantStyles = {
  neutral: 'text-text-base',
  income: 'text-success-600',
  expense: 'text-error-600',
};

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Amount = React.forwardRef<HTMLSpanElement, AmountProps>(
  (
    {
      className,
      value,
      currency: propCurrency,
      locale: propLocale,
      variant = 'neutral',
      size = 'md',
      weight = 'semibold',
      signDisplay = 'auto',
      ...props
    },
    ref
  ) => {
    const config = useUIConfig();
    const currency = propCurrency || config.currency;
    const locale = propLocale || config.locale;

    const formattedValue = React.useMemo(() => {
      let finalValue = value;
      // If signDisplay is never, we use the absolute value
      if (signDisplay === 'never') {
        finalValue = Math.abs(value);
      }

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        signDisplay: signDisplay === 'never' ? 'auto' : signDisplay,
      }).format(finalValue);
    }, [value, currency, locale, signDisplay]);

    return (
      <span
        ref={ref}
        className={cn(
          'tabular-nums tracking-tight',
          variantStyles[variant],
          sizeStyles[size],
          weightStyles[weight],
          className
        )}
        {...props}
      >
        {formattedValue}
      </span>
    );
  }
);
Amount.displayName = 'Amount';
