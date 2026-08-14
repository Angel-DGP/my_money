import { useState, useRef, useEffect, useMemo } from 'react';
import { useCategoriesQuery, type CategoryType } from '@entities/category';
import { Icon, Badge, type IconName } from '@mymoney/ui';

export interface CategorySelectProps {
  id?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  filterType?: CategoryType | 'ALL' | undefined;
  placeholder?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  allowNone?: boolean | undefined;
  noneLabel?: string | undefined;
  className?: string | undefined;
  excludeId?: string | undefined;
}

interface FlatCategoryOption {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentName?: string | undefined;
  isChild?: boolean | undefined;
}

export function CategorySelect({
  id,
  name,
  label,
  value,
  onChange,
  filterType = 'ALL',
  placeholder = 'Seleccionar categoría...',
  error,
  disabled = false,
  required = false,
  allowNone = false,
  noneLabel = 'Sin categoría',
  className = '',
  excludeId,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [], isLoading } = useCategoriesQuery();

  // Flatten and filter categories
  const flatOptions = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const list: FlatCategoryOption[] = [];

    categories.forEach((cat) => {
      if (excludeId && cat.id === excludeId) return;
      if (filterType !== 'ALL' && cat.type !== filterType) return;

      list.push({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color || '#8b5cf6',
        icon: cat.icon || 'tag',
        isChild: false,
      });

      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach((sub) => {
          if (excludeId && sub.id === excludeId) return;
          if (filterType !== 'ALL' && sub.type !== filterType) return;

          list.push({
            id: sub.id,
            name: sub.name,
            type: sub.type,
            color: sub.color || cat.color || '#8b5cf6',
            icon: sub.icon || cat.icon || 'tag',
            parentName: cat.name,
            isChild: true,
          });
        });
      }
    });

    return list;
  }, [categories, filterType, excludeId]);

  // Selected item
  const selectedItem = useMemo(() => {
    if (!value || value === 'none' || value === 'all') return null;
    return flatOptions.find((c) => c.id === value) || null;
  }, [value, flatOptions]);

  // Filtered by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return flatOptions;
    const q = searchQuery.toLowerCase().trim();
    return flatOptions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.parentName && c.parentName.toLowerCase().includes(q))
    );
  }, [flatOptions, searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (catId: string) => {
    onChange?.(catId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const hasError = !!error;

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary flex items-center justify-between">
          <span>
            {label} {required && <span className="text-error-500">*</span>}
          </span>
        </label>
      )}

      {/* Hidden input for forms */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value || ''}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-150 ${
          hasError
            ? 'border-error-500 ring-1 ring-error-500/30'
            : isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-surface'
            : 'border-border-subtle hover:border-text-secondary/40 bg-surface'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          {selectedItem ? (
            <>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: selectedItem.color }}
              >
                <Icon name={selectedItem.icon as IconName} size="xs" />
              </div>
              <div className="flex items-center gap-1.5 truncate">
                {selectedItem.parentName && (
                  <span className="text-xs text-text-muted">{selectedItem.parentName} /</span>
                )}
                <span className="font-medium text-text-primary truncate">{selectedItem.name}</span>
              </div>
            </>
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-text-muted shrink-0 ml-2">
          {selectedItem && (
            <Badge variant={selectedItem.type === 'INCOME' ? 'success' : 'neutral'} size="sm">
              {selectedItem.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
            </Badge>
          )}
          <Icon
            name="chevron-down"
            size="xs"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full z-50 rounded-2xl border border-border-subtle bg-surface shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2.5 border-b border-border-subtle bg-surface-2/40">
            <div className="relative flex items-center">
              <Icon
                name="search"
                size="xs"
                className="absolute left-2.5 text-text-muted pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar categoría..."
                className="w-full bg-background border border-border-subtle rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-text-muted hover:text-text-primary text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {allowNone && (
              <button
                type="button"
                onClick={() => handleSelect('none')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                  !value || value === 'none'
                    ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-text-secondary hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-surface-2 flex items-center justify-center text-text-muted">
                    <Icon name="tag" size="xs" />
                  </div>
                  <span>{noneLabel}</span>
                </div>
                {(!value || value === 'none') && (
                  <Icon name="check" size="xs" className="text-primary-500" />
                )}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted">
                No se encontraron categorías
              </div>
            ) : (
              filteredOptions.map((cat) => {
                const isSelected = value === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      cat.isChild ? 'pl-6' : ''
                    } ${
                      isSelected
                        ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon name={cat.icon as IconName} size="xs" />
                      </div>
                      <div className="truncate">
                        {cat.isChild && cat.parentName && (
                          <span className="text-[10px] text-text-muted block leading-none mb-0.5">
                            {cat.parentName}
                          </span>
                        )}
                        <span className="truncate font-medium">{cat.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-text-muted opacity-75 uppercase">
                        {cat.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                      </span>
                      {isSelected && (
                        <Icon name="check" size="xs" className="text-primary-500" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-error-500 mt-0.5">{error}</p>}
    </div>
  );
}
