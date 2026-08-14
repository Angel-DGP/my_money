import type { InputHTMLAttributes } from 'react';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'size' | 'prefix'> {
  id?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
  value?: number | string | undefined;
  defaultValue?: number | string | undefined;
  onChange?: ((value: number | undefined) => void) | undefined;
  onValueChange?: ((value: number | undefined) => void) | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  showSteppers?: boolean | undefined;
}
