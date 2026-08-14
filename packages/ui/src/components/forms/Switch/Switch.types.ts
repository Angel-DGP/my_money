export interface SwitchProps {
  id?: string | undefined;
  name?: string | undefined;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  description?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}
