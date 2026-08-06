import { cn } from '../../../utils/cn';
import { Label } from '../../core/Label';

export interface ColorPickerProps {
  id?: string | undefined;
  name?: string | undefined;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
  label?: string | undefined;
}

const PREDEFINED_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export const ColorPicker = ({
  id,
  name,
  value,
  onChange,
  disabled,
  className,
  label,
}: ColorPickerProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => onChange(color)}
            className={cn(
              'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              value === color ? 'border-primary-600 scale-110' : 'border-transparent',
              disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Seleccionar color ${color}`}
          />
        ))}
        
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-border-subtle hover:border-primary-400 transition-colors">
          <input
            id={id}
            name={name}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Color personalizado"
          />
          <div 
            className="w-6 h-6 rounded-full" 
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
      <div className="text-xs text-text-secondary uppercase">
        {value}
      </div>
    </div>
  );
};
