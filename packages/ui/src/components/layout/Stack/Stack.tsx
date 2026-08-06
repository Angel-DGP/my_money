import * as React from 'react';
import { cn } from '../../../utils/cn';

type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: Spacing;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

const spacingClasses: Record<Spacing, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

const directionClasses: Record<'row' | 'col', string> = {
  row: 'flex-row',
  col: 'flex-col',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      spacing = 'md',
      direction = 'col',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = 'Stack';
