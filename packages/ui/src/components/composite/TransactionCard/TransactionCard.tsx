import * as React from 'react';
import { Card } from '../../layout/Card';
import { Badge } from '../../feedback/Badge';
import { Icon, type IconName } from '../../core/Icon';
import { Amount } from '../Amount';
import { useUIConfig } from '../../../providers/ConfigProvider';
import { cn } from '../../../utils/cn';

export interface TransactionBadge {
  text: string;
  variant?: 'neutral' | 'success' | 'warning' | 'error';
}

export interface TransactionCardProps extends Omit<React.ComponentPropsWithoutRef<typeof Card>, 'title'> {
  /** Title of the transaction (e.g. Starbucks, Transfer to Alice) */
  title: string;
  /** Category of the transaction */
  category?: string;
  /** Date of the transaction */
  date: Date;
  /** Monetary amount */
  amount: number;
  /** Semantic variant representing the type of transaction */
  variant?: 'income' | 'expense' | 'transfer';
  /** Icon to display */
  icon?: IconName;
  /** List of badges to display below the title */
  badges?: TransactionBadge[];
  /** Optional actions element, typically a Dropdown or Button */
  actions?: React.ReactNode;
}

export const TransactionCard = React.forwardRef<HTMLDivElement, TransactionCardProps>(
  (
    {
      className,
      title,
      category,
      date,
      amount,
      variant = 'expense',
      icon = 'circle',
      badges = [],
      actions,
      ...props
    },
    ref
  ) => {
    const config = useUIConfig();
    
    // Format the date based on locale and timezone
    const formattedDate = React.useMemo(() => {
      return new Intl.DateTimeFormat(config.locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: config.timeZone || 'America/Guayaquil',
      }).format(date);
    }, [date, config.locale, config.timeZone]);

    // Icon background color based on variant
    const iconBgClass = {
      income: 'bg-success-100 text-success-700',
      expense: 'bg-error-100 text-error-700',
      transfer: 'bg-primary-100 text-primary-700',
    }[variant];

    const amountVariant = variant === 'transfer' ? 'neutral' : variant;
    // We typically always show sign for income (+) and expense (-)
    const signDisplay = variant === 'transfer' ? 'auto' : 'always';
    const amountToUse = variant === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    return (
      <Card ref={ref} padding="md" className={cn('flex flex-row items-center gap-4', className)} {...props}>
        {/* Icon */}
        <div className={cn('flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center', iconBgClass)}>
          <Icon name={icon!} size="md" />
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div className="truncate">
              <h4 className="font-semibold text-text-primary truncate">{title}</h4>
              <p className="text-sm text-text-secondary truncate">
                {category ? `${category} • ` : ''}{formattedDate}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <Amount 
                value={amountToUse} 
                variant={amountVariant} 
                signDisplay={signDisplay}
                weight="bold"
                size="md"
              />
            </div>
          </div>
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map((badge, idx) => (
                <Badge key={idx} variant={badge.variant || 'neutral'}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0 ml-2">
            {actions}
          </div>
        )}
      </Card>
    );
  }
);
TransactionCard.displayName = 'TransactionCard';
