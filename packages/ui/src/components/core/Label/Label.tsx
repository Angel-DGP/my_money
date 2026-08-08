import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string | undefined;
  required?: boolean;
}

export const Label = ({ htmlFor, className, children, required, ...props }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-text-primary ${className || ''}`}
      {...props}
    >
      {children} {required && <span className="text-error-500">*</span>}
    </label>
  );
};
