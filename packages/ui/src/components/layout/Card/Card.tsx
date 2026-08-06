import * as React from 'react';
import { cn } from '../../../utils/cn';
import { Slot } from '../../../utils/slot';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-8',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  padding?: CardPadding;
}

const CardContext = React.createContext<{ padding: CardPadding }>({ padding: 'sm' });

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild = false, padding = 'sm', ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    
    return (
      <CardContext.Provider value={{ padding }}>
        <Comp
          ref={ref}
          className={cn(
            'rounded-xl border border-border-subtle bg-background text-text-primary shadow-sm',
            paddingClasses[padding],
            className
          )}
          {...props}
        />
      </CardContext.Provider>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const { padding } = React.useContext(CardContext);
    
    return (
      <Comp
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          className
        )}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'Card.Header';

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const { padding } = React.useContext(CardContext);
    
    return (
      <Comp
        ref={ref}
        className={cn(className)}
        {...props}
      />
    );
  }
);
CardBody.displayName = 'Card.Body';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const { padding } = React.useContext(CardContext);
    
    return (
      <Comp
        ref={ref}
        className={cn(
          'flex items-center',
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'Card.Footer';

export { CardHeader, CardBody, CardFooter };
