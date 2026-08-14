import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'disabled' | 'required' | 'id' | 'name'> {
  id?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  searchable?: boolean | undefined;
  disabled?: boolean | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  onChange?: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | undefined;
  options?: Array<{ label: string; value: string; disabled?: boolean | undefined }> | undefined;
}

export interface SelectContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  internalValue: string | number | readonly string[] | undefined;
  handleSelectOption: (optValue: string, optDisabled?: boolean) => void;
  options: SelectOption[];
  filteredOptions: SelectOption[];
  selectedOption: SelectOption | undefined;
  displayLabel: ReactNode;
  hasError: boolean;
  searchable: boolean;
  disabled?: boolean | undefined;
  placeholder?: string | undefined;
  id?: string | undefined;
  name?: string | undefined;
  required?: boolean | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
  onChange?: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | undefined;
  handleRef: (node: HTMLSelectElement) => void;
}
