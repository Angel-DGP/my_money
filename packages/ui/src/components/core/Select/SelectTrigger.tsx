
import { cn } from '../Button';
import { Icon } from '../Icon';
import { useSelectContext } from './hooks/useSelect';

export function SelectTrigger() {
  const {
    isOpen,
    setIsOpen,
    displayLabel,
    hasError,
    disabled,
    selectedOption,
  } = useSelectContext();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsOpen((prev) => !prev)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-lg border bg-background/50 backdrop-blur-sm px-4 py-2 text-sm text-text-primary transition-all shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isOpen ? 'border-primary-500 ring-1 ring-primary-500' : hasError ? 'border-error-500' : 'border-border-subtle hover:border-border-strong'
      )}
    >
      <span className={cn('truncate', !selectedOption && 'text-text-muted')}>
        {displayLabel}
      </span>
      <Icon 
        name="chevron-down" 
        size="sm" 
        className={cn('text-text-secondary transition-transform duration-200', isOpen && 'rotate-180')} 
      />
    </button>
  );
}
