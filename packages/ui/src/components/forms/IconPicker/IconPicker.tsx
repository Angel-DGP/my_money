import { cn } from '../../../utils/cn';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../../core/Command/Command';
import { iconRegistry, type IconName, Icon } from '../../core/Icon';

export interface IconPickerProps {
  value: IconName;
  onChange: (value: IconName) => void;
  className?: string;
}

const iconsList = Object.keys(iconRegistry) as IconName[];

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  return (
    <div className={cn("w-full", className)}>
      <Command className="w-full h-[280px] rounded-xl border border-border-subtle bg-surface shadow-sm overflow-hidden">
        <CommandInput placeholder="Buscar icono..." className="h-10 text-sm border-none ring-0 outline-none" />
        <CommandList className="max-h-[240px] overflow-y-auto p-2 scrollbar-thin">
          <CommandEmpty className="py-6 text-center text-sm text-text-secondary">
            No se encontró el icono.
          </CommandEmpty>
          <CommandGroup className="px-1 py-1">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 pt-1">
              {iconsList.map((iconName) => (
                <CommandItem
                  key={iconName}
                  value={iconName}
                  onSelect={(currentValue) => {
                    onChange(currentValue as IconName);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-colors',
                    'hover:bg-surface-hover hover:text-primary-600',
                    value === iconName ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ring-2 ring-primary-500/50' : 'text-text-secondary'
                  )}
                >
                  <Icon name={iconName} size="md" />
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
