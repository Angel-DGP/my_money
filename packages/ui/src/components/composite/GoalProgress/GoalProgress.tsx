import * as React from 'react';
import { cn } from '../../../utils/cn';
import { Amount } from '../Amount';

export interface GoalProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The amount already saved or achieved */
  current: number;
  /** The target goal amount */
  target: number;
  /** The remaining amount (target - current, can be negative) */
  remaining?: number;
  /** The percentage achieved (0-100 or more) */
  percentage?: number;
  /** ISO 4217 currency code. Defaults to UIConfigProvider */
  currency?: string;
  /** Whether to show the percentage text */
  showPercentage?: boolean;
  /** Whether to show the remaining amount text */
  showRemaining?: boolean;
}

export const GoalProgress = React.forwardRef<HTMLDivElement, GoalProgressProps>(
  (
    {
      className,
      current,
      target,
      remaining: propRemaining,
      percentage: propPercentage,
      currency,
      showPercentage = true,
      showRemaining = true,
      ...props
    },
    ref
  ) => {
    const remaining = propRemaining ?? (target - current);
    const percentage = propPercentage ?? (target > 0 ? (current / target) * 100 : 0);
    const isGoalReached = current >= target;
    // Cap visual percentage at 100% for the bar
    const visualPercentage = Math.min(100, Math.max(0, percentage));

    return (
      <div ref={ref} className={cn('flex flex-col gap-2 w-full', className)} {...props}>
        {/* Header: Amount current and target */}
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <Amount 
              value={current} 
              currency={currency || 'USD'} 
              size="lg" 
              weight="bold" 
              variant={isGoalReached ? 'income' : 'neutral'} 
            />
            <span className="text-sm text-text-secondary">de</span>
            <Amount 
              value={target} 
              currency={currency || 'USD'} 
              size="sm" 
              weight="normal" 
              className="text-text-secondary" 
            />
          </div>
          {showPercentage && (
            <span className={cn(
              "text-sm font-medium",
              isGoalReached ? "text-success-600" : "text-primary-600"
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
              isGoalReached ? "bg-success-500" : "bg-primary-500"
            )}
            style={{ width: `${visualPercentage}%` }}
          />
        </div>

        {/* Footer: Remaining amount */}
        {showRemaining && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary">
              {isGoalReached ? 'Meta completada' : 'Faltan'}
            </span>
            {!isGoalReached && (
              <Amount 
                value={Math.abs(remaining)} 
                currency={currency || 'USD'} 
                size="sm" 
                weight="medium"
                variant="neutral"
              />
            )}
          </div>
        )}
      </div>
    );
  }
);
GoalProgress.displayName = 'GoalProgress';
