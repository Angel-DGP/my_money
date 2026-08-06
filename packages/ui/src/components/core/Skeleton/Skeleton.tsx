import { cn } from '../../../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div 
      className={cn(
        "animate-pulse bg-surface-2", 
        variants[variant],
        className
      )} 
    />
  );
}
