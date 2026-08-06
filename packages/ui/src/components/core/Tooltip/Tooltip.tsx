import React from 'react';
import { cn } from '../../../utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={cn(
        "absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        positions[position],
        className
      )}>
        <div className="bg-neutral-900 dark:bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded whitespace-nowrap shadow-lg">
          {content}
        </div>
      </div>
    </div>
  );
}
