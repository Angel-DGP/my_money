import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface UseTableStateOptions<T> {
  data: T[];
  pageSize?: number;
  searchFields?: (keyof T | ((item: T) => string))[];
  filterField?: (item: T, filter: string) => boolean;
  defaultSort?: SortState;
  sortFn?: (a: T, b: T, column: string, direction: SortDirection) => number;
}

export function useTableState<T>({
  data,
  pageSize = 10,
  searchFields = [],
  filterField,
  defaultSort = { column: null, direction: null },
  sortFn,
}: UseTableStateOptions<T>) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...data];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val =
            typeof field === 'function'
              ? field(item)
              : String((item as Record<string, unknown>)[field as string] ?? '');
          return val.toLowerCase().includes(q);
        })
      );
    }

    // Custom filter
    if (activeFilter !== 'all' && filterField) {
      result = result.filter((item) => filterField(item, activeFilter));
    }

    return result;
  }, [data, search, activeFilter, searchFields, filterField]);

  const sorted = useMemo(() => {
    if (!sort.column || !sort.direction) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortFn) return sortFn(a, b, sort.column!, sort.direction);
      const aVal = (a as Record<string, unknown>)[sort.column!];
      const bVal = (b as Record<string, unknown>)[sort.column!];
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal ?? '').localeCompare(String(bVal ?? ''));
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort, sortFn]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    return sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [sorted, safePage, pageSize]);

  const toggleSort = (column: string) => {
    setPage(1);
    setSort((prev) => {
      if (prev.column !== column) return { column, direction: 'asc' };
      if (prev.direction === 'asc') return { column, direction: 'desc' };
      return { column: null, direction: null };
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };

  return {
    search,
    setSearch: handleSearch,
    activeFilter,
    setActiveFilter: handleFilter,
    sort,
    toggleSort,
    page: safePage,
    setPage,
    totalPages,
    totalFiltered: filtered.length,
    paginated,
    sorted,
    filtered,
  };
}
