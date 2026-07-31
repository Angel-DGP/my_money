import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
}

export const Label = ({ htmlFor, className, children, ...props }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-[var(--color-text-primary)] ${className || ''}`}
      {...props}
    >
      {children}
    </label>
  );
};
