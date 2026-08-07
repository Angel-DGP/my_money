import React from 'react';
import { cn } from '../../../utils/cn';

export interface FormLayoutProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  /** Columns gap. Defaults to 'default' (gap-4) */
  gap?: 'sm' | 'default' | 'lg';
}

const gapMap = {
  sm: 'gap-3',
  default: 'gap-4',
  lg: 'gap-6',
};

export const FormLayout = React.forwardRef<HTMLFormElement, FormLayoutProps>(
  ({ children, className, gap = 'default', ...props }, ref) => {
    // Extraemos el Footer (si existe) para colocarlo fuera del grid
    const childrenArray = React.Children.toArray(children);
    const footer = childrenArray.find(
      (child) => React.isValidElement(child) && (child.type as any).displayName === 'PageContainerFooter'
    );
    const gridChildren = childrenArray.filter(
      (child) => React.isValidElement(child) ? (child.type as any).displayName !== 'PageContainerFooter' : true
    );

    return (
      <form
        ref={ref}
        className={cn("flex flex-col flex-1", className)}
        {...props}
      >
        <div className={cn("grid grid-cols-1 md:grid-cols-12 content-start pb-6", gapMap[gap])}>
          {gridChildren}
        </div>
        {footer}
      </form>
    );
  }
);

FormLayout.displayName = 'FormLayout';
