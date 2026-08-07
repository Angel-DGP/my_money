import { cn } from '../../../utils/cn';
import { Icon } from '../../core/Icon';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertBannerProps {
  variant?: AlertVariant | undefined;
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({ 
  variant = 'info', 
  title, 
  description, 
  onDismiss,
  className 
}: AlertBannerProps) {
  
  const variants = {
    info: 'bg-info-50 text-info-900 border-info-200 dark:bg-info-950 dark:text-info-100 dark:border-info-900',
    warning: 'bg-warning-50 text-warning-900 border-warning-200 dark:bg-warning-950 dark:text-warning-100 dark:border-warning-900',
    error: 'bg-error-50 text-error-900 border-error-200 dark:bg-error-950 dark:text-error-100 dark:border-error-900',
    success: 'bg-success-50 text-success-900 border-success-200 dark:bg-success-950 dark:text-success-100 dark:border-success-900',
  };

  const icons = {
    info: <Icon name="info" className="text-info-500 mt-0.5" />,
    warning: <Icon name="alert-triangle" className="text-warning-500 mt-0.5" />,
    error: <Icon name="x-circle" className="text-error-500 mt-0.5" />,
    success: <Icon name="check-circle" className="text-success-500 mt-0.5" />,
  };

  return (
    <div className={cn("p-4 border rounded-lg flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm", variants[variant], className)}>
      <div className="shrink-0">{icons[variant]}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        {description && (
          <p className="text-sm mt-1 opacity-90 leading-relaxed">{description}</p>
        )}
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1 -mr-2 -mt-2 self-start rounded-md hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Cerrar alerta"
        >
          <Icon name="x" size="sm" />
        </button>
      )}
    </div>
  );
}
