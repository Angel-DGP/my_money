import { cn } from '../../../utils/cn';
import { Icon, type IconName } from '../../core/Icon';
import { Button } from '../../core/Button';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon = 'inbox', 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4 text-text-muted">
        <Icon name={icon} size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
