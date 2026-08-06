import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string | undefined;
}

export const Label = ({ htmlFor, className, children, ...props }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-text-primary ${className || ''}`}
      {...props}
    >
      {children}
    </label>
  );
};
