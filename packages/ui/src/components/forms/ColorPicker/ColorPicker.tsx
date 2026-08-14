import { cn } from '../../../utils/cn';
import { Label } from '../../core/Label';
import { Icon } from '../../core/Icon';

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
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#059669', // Forest Green
  '#0284c7', // Ocean Blue
  '#7c3aed', // Deep Purple
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
  const isPredefined = PREDEFINED_COLORS.includes(value.toLowerCase());

  return (
    <div className={cn('space-y-2.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="flex flex-wrap items-center gap-2">
        {PREDEFINED_COLORS.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              disabled={disabled}
              onClick={() => onChange(color)}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
                'hover:scale-105 active:scale-95 focus:outline-none',
                isSelected
                  ? 'ring-2 ring-offset-2 ring-primary-500 ring-offset-background scale-105 shadow-sm'
                  : 'border border-black/10 dark:border-white/10 opacity-90 hover:opacity-100',
                disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Seleccionar color ${color}`}
            >
              {isSelected && <Icon name="check" size="xs" className="text-white drop-shadow" />}
            </button>
          );
        })}

        {/* Custom Color Input */}
        <div
          className={cn(
            'relative flex items-center justify-center w-8 h-8 rounded-xl border border-dashed transition-all',
            !isPredefined && value
              ? 'ring-2 ring-offset-2 ring-primary-500 ring-offset-background scale-105'
              : 'border-border-subtle hover:border-primary-400'
          )}
          style={!isPredefined && value ? { backgroundColor: value } : undefined}
          title="Elegir color personalizado"
        >
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
          {!isPredefined && value ? (
            <Icon name="check" size="xs" className="text-white drop-shadow" />
          ) : (
            <Icon name="palette" size="xs" className="text-text-muted pointer-events-none" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs text-text-secondary uppercase">{value}</span>
      </div>
    </div>
  );
};
