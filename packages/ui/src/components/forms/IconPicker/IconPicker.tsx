import { cn } from '../../../utils/cn';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../../core/Command/Command';
import { iconRegistry, type IconName, Icon } from '../../core/Icon';

export interface IconPickerProps {
  value: IconName;
  onChange: (value: IconName) => void;
  className?: string;
  disabled?: boolean;
}

const iconsList = Object.keys(iconRegistry) as IconName[];

export function IconPicker({ value, onChange, className, disabled = false }: IconPickerProps) {
  return (
    <div className={cn("w-full", disabled && "opacity-60 pointer-events-none", className)}>
      <Command className="w-full h-[280px] rounded-2xl border border-border-subtle bg-surface shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-border-subtle px-3 py-1.5 bg-surface-2/40">
          <CommandInput placeholder="Buscar icono..." className="h-9 text-xs border-none ring-0 outline-none bg-transparent" />
        </div>
        <CommandList className="flex-1 max-h-[230px] overflow-y-auto p-2 scrollbar-thin">
          <CommandEmpty className="py-8 text-center text-xs text-text-secondary">
            No se encontró ningún icono con ese nombre.
          </CommandEmpty>
          <CommandGroup className="px-1 py-1">
            <div className="icon-picker-grid grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 pt-1">
              {iconsList.map((iconName) => {
                const isSelected = value === iconName;
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={(currentValue) => {
                      onChange(currentValue as IconName);
                    }}
                    className={cn(
                      'flex items-center justify-center aspect-square rounded-xl cursor-pointer transition-all duration-150',
                      'hover:bg-surface-2 hover:text-text-primary text-text-muted',
                      isSelected &&
                        'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold ring-2 ring-primary-500/50 shadow-sm scale-105'
                    )}
                    title={iconName}
                  >
                    <Icon name={iconName} size="md" />
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
