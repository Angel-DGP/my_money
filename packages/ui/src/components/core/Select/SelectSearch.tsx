
import { Icon } from '../Icon';
import { useSelectContext } from './hooks/useSelect';

export function SelectSearch() {
  const { searchable, searchQuery, setSearchQuery } = useSelectContext();

  if (!searchable) return null;

  return (
    <div className="p-2 border-b border-border-subtle sticky top-0 bg-surface/90 dark:bg-surface-2/90 z-10 backdrop-blur-md">
      <div className="relative">
        <Icon name="search" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
        <input
          type="text"
          className="w-full bg-background/50 border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder:text-text-muted"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
