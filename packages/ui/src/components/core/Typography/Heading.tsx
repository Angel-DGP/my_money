import * as React from 'react';
import { cn } from '../../../utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingAlign = 'left' | 'center' | 'right';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  align?: HeadingAlign;
}

const levelClasses: Record<HeadingLevel, string> = {
  h1: 'text-3xl sm:text-4xl font-bold tracking-tight',
  h2: 'text-2xl sm:text-3xl font-bold tracking-tight',
  h3: 'text-xl sm:text-2xl font-semibold',
  h4: 'text-lg sm:text-xl font-semibold',
  h5: 'text-base sm:text-lg font-medium',
  h6: 'text-sm sm:text-base font-medium',
};

const alignClasses: Record<HeadingAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 'h2', align = 'left', className, children, ...props }, ref) => {
    const Component = level;

    return (
      <Component
        ref={ref}
        className={cn('text-text-primary', levelClasses[level], alignClasses[align], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';
