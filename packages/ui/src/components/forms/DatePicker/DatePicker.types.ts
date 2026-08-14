export interface DatePickerProps {
  id?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
  value?: string | Date | undefined;
  defaultValue?: string | Date | undefined;
  onChange?: ((date: string) => void) | undefined;
  min?: string | undefined;
  max?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
  showPresets?: boolean | undefined;
}
