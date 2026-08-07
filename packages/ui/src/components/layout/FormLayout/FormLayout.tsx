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

/**
 * FormLayout
 *
 * Contenedor de formulario que organiza los campos en un grid responsivo.
 * El scroll de la página lo gestiona PageContainer.Body (overflow-y-auto).
 * El footer (PageContainerFooter) se renderiza via portal fuera del scroll,
 * por lo que puede colocarse directamente como hijo de FormLayout sin problemas.
 */
export const FormLayout = React.forwardRef<HTMLFormElement, FormLayoutProps>(
  ({ children, className, gap = 'default', ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('flex flex-col', className)}
        {...props}
      >
        <div className={cn('grid grid-cols-1 md:grid-cols-12 content-start pb-6', gapMap[gap])}>
          {children}
        </div>
      </form>
    );
  }
);

FormLayout.displayName = 'FormLayout';
