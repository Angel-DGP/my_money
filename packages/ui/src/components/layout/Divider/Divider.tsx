import React from 'react';
import { cn } from '../../../utils/cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

export const Divider = ({
  orientation = 'horizontal',
  decorative = true,
  className,
}: DividerProps) => {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation === 'vertical' && !decorative ? 'vertical' : undefined}
      className={cn(
        'shrink-0 bg-border-subtle',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
    />
  );
};
