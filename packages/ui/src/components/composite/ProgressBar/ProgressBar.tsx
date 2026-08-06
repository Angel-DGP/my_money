import { cn } from '../../../utils/cn';

export type ProgressBarVariant = 'primary' | 'success' | 'warning' | 'error' | 'brand';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: ProgressBarVariant;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  variant = 'primary', 
  size = 'md', 
  showLabel = false,
  className 
}: ProgressBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  const variants = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    brand: 'bg-neutral-900 dark:bg-neutral-50', // high contrast brand color
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className={cn("w-full bg-surface-2 rounded-full overflow-hidden", sizes[size])}>
        <div 
          className={cn("h-full rounded-full transition-all duration-700 ease-out", variants[variant])} 
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end">
          <span className="text-xs font-medium text-text-secondary">{Math.round(safeProgress)}%</span>
        </div>
      )}
    </div>
  );
}
