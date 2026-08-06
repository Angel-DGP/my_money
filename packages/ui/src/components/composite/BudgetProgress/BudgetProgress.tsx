import * as React from 'react';
import { cn } from '../../../utils/cn';
import { Amount } from '../Amount';

export interface BudgetProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The amount already spent */
  spent: number;
  /** The total budget limit */
  limit: number;
  /** The remaining amount (limit - spent, can be negative) */
  remaining: number;
  /** The percentage spent (0-100 or more) */
  percentage: number;
  /** ISO 4217 currency code. Defaults to UIConfigProvider */
  currency?: string;
  /** Whether to show the percentage text */
  showPercentage?: boolean;
  /** Whether to show the remaining amount text */
  showRemaining?: boolean;
}

export const BudgetProgress = React.forwardRef<HTMLDivElement, BudgetProgressProps>(
  (
    {
      className,
      spent,
      limit,
      remaining,
      percentage,
      currency,
      showPercentage = true,
      showRemaining = true,
      ...props
    },
    ref
  ) => {
    const isOverBudget = spent > limit;
    // Cap visual percentage at 100% for the bar
    const visualPercentage = Math.min(100, Math.max(0, percentage));

    return (
      <div ref={ref} className={cn('flex flex-col gap-2 w-full', className)} {...props}>
        {/* Header: Amount spent and limit */}
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <Amount 
              value={spent} 
              currency={currency || 'USD'} 
              size="lg" 
              weight="bold" 
              variant={isOverBudget ? 'expense' : 'neutral'} 
            />
            <span className="text-sm text-text-secondary">de</span>
            <Amount 
              value={limit} 
              currency={currency || 'USD'} 
              size="sm" 
              weight="normal" 
              className="text-text-secondary" 
            />
          </div>
          {showPercentage && (
            <span className={cn(
              "text-sm font-medium",
              isOverBudget ? "text-error-600" : "text-text-secondary"
            )}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isOverBudget ? "bg-error-500" : percentage > 85 ? "bg-warning-500" : "bg-primary-500"
            )}
            style={{ width: `${visualPercentage}%` }}
          />
        </div>

        {/* Footer: Remaining amount */}
        {showRemaining && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">
              {isOverBudget ? 'Excedido por' : 'Disponible'}
            </span>
            <Amount 
              value={Math.abs(remaining)} 
              currency={currency || 'USD'} 
              size="sm" 
              weight="medium"
              variant={isOverBudget ? 'expense' : 'neutral'}
            />
          </div>
        )}
      </div>
    );
  }
);
BudgetProgress.displayName = 'BudgetProgress';
