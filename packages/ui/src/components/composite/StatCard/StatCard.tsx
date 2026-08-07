import { Icon, type IconName } from '../../core/Icon';
import { Card } from '../../layout/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  currency?: string;
  icon?: IconName;
  trend?: {
    value: number;
    label?: string | undefined;
    direction?: 'up' | 'down' | 'neutral' | undefined;
    isPositive?: boolean | undefined;
  } | undefined;
  className?: string;
}

export function StatCard({ title, value, currency, icon, trend, className = '' }: StatCardProps) {
  const isUp = trend?.direction === 'up' || trend?.isPositive === true;
  const isDown = trend?.direction === 'down' || trend?.isPositive === false;

  const trendColor = 
    isUp ? 'text-success-500' : 
    isDown ? 'text-error-500' : 
    'text-text-muted';

  const trendIcon = 
    isUp ? 'trending-up' : 
    isDown ? 'trending-down' : 
    undefined;

  const formattedValue = typeof value === 'number' && currency
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
    : value;

  return (
    <Card className={`p-5 flex flex-col gap-3 ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && (
          <div className="p-2 bg-surface-2 rounded-lg text-text-muted">
            <Icon name={icon} size="sm" />
          </div>
        )}
      </div>
      
      <div className="mt-1">
        <h3 className="text-2xl font-bold text-text-primary">{formattedValue}</h3>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`flex items-center text-xs font-medium ${trendColor}`}>
              {trendIcon && <Icon name={trendIcon} size="xs" className="mr-0.5" />}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
            {trend.label && (
              <span className="text-xs text-text-muted">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
