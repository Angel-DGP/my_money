import React, { createContext, useContext, useId } from 'react';
import { cn } from '../../../utils/cn';

export interface FormLayoutContextValue {
  formId: string;
}

export const FormLayoutContext = createContext<FormLayoutContextValue | null>(null);

export function useFormLayoutContext() {
  return useContext(FormLayoutContext);
}

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
  ({ children, className, gap = 'default', id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const formId = providedId || generatedId;

    return (
      <FormLayoutContext.Provider value={{ formId }}>
        <form
          ref={ref}
          id={formId}
          className={cn('flex flex-col', className)}
          {...props}
        >
          <div className={cn('grid grid-cols-1 md:grid-cols-12 content-start pb-6', gapMap[gap])}>
            {children}
          </div>
        </form>
      </FormLayoutContext.Provider>
    );
  }
);

FormLayout.displayName = 'FormLayout';
