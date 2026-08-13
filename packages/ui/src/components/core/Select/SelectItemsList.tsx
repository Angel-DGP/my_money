import { cn } from '../Button';
import { Icon } from '../Icon';
import { useSelectContext } from './hooks/useSelect';

export function SelectItemsList() {
  const { filteredOptions, internalValue, handleSelectOption } = useSelectContext();

  return (
    <div className="overflow-auto p-1.5 max-h-[220px] custom-scrollbar space-y-0.5">
      {filteredOptions.length === 0 ? (
        <div className="p-2 text-sm text-text-muted text-center py-4">No hay resultados</div>
      ) : (
        filteredOptions.map((opt, idx) => {
          const isSelected = opt.value === String(internalValue);
          return (
            <div
              key={`${opt.value}-${idx}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelectOption(opt.value, opt.disabled)}
              className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors my-0.5',
                opt.disabled
                  ? 'pointer-events-none opacity-50'
                  : isSelected
                    ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-text-primary hover:bg-surface-2'
              )}
            >
              <span className="truncate block w-full pr-6">{opt.label}</span>
              {isSelected && (
                <span className="absolute right-3 flex items-center justify-center">
                  <Icon name="check" size="sm" className="text-primary-500" />
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
