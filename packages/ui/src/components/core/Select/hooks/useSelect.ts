import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from 'react';
import type { SelectProps, SelectContextValue, SelectOption } from '../Select.types';

export const SelectContext = createContext<SelectContextValue | undefined>(undefined);

export function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelectContext must be used within a Select component');
  }
  return context;
}

export function useSelect(
  props: SelectProps,
  ref: React.ForwardedRef<HTMLSelectElement>,
  children: React.ReactNode
) {
  const {
    value: propValue,
    defaultValue,
    disabled,
    onValueChange,
    options: propOptions,
    searchable = false,
    placeholder,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [internalValue, setInternalValue] = useState<string | number | readonly string[] | undefined>(
    propValue !== undefined ? propValue : defaultValue
  );

  useEffect(() => {
    if (propValue !== undefined) {
      setInternalValue(propValue);
    } else if (selectRef.current && selectRef.current.value !== String(internalValue ?? '')) {
      setInternalValue(selectRef.current.value);
    }
  });

  const selectRef = useRef<HTMLSelectElement | null>(null);

  const handleRef = (node: HTMLSelectElement) => {
    selectRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
    }
  };

  const options = useMemo(() => {
    const opts: SelectOption[] = [];
    if (propOptions) {
      propOptions.forEach(opt => opts.push(opt));
    }
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const optionChild = child as React.ReactElement<React.ComponentProps<'option'>>;
        opts.push({
          value: (optionChild.props.value as string) ?? '',
          label: optionChild.props.children as React.ReactNode,
          disabled: optionChild.props.disabled,
        });
      }
    });
    return opts;
  }, [propOptions, children]);

  const selectedOption = options.find((opt) => opt.value === String(internalValue));
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || 'Seleccionar...');

  const handleSelectOption = (optValue: string, optDisabled?: boolean) => {
    if (optDisabled || disabled) return;
    
    setInternalValue(optValue);
    onValueChange?.(optValue);
    setIsOpen(false);

    if (selectRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(selectRef.current, optValue);
        const ev = new Event('change', { bubbles: true });
        selectRef.current.dispatchEvent(ev);
      } else {
        selectRef.current.value = optValue;
        const ev = new Event('change', { bubbles: true });
        selectRef.current.dispatchEvent(ev);
      }
    }
  };

  const filteredOptions = useMemo(() => {
    return searchable 
      ? options.filter(opt => {
          const labelText = typeof opt.label === 'string' ? opt.label : String(opt.label);
          return labelText.toLowerCase().includes(searchQuery.toLowerCase());
        })
      : options;
  }, [options, searchable, searchQuery]);

  return {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    internalValue,
    handleSelectOption,
    options,
    filteredOptions,
    selectedOption,
    displayLabel,
    handleRef,
  };
}
