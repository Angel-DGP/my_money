import React from 'react';
import { Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Select } from '../../core/Select';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../../layout/Table';
import { useTableState, type UseTableStateOptions, type SortState } from '../../../hooks/useTableState';

// ─── Toolbar ────────────────────────────────────────────────────────────────
export interface FilterOption {
  label: string;
  value: string;
}

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string | undefined;
  filters?: FilterOption[] | undefined;
  activeFilter?: string | undefined;
  onFilterChange?: ((value: string) => void) | undefined;
  className?: string | undefined;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  filters = [],
  activeFilter = 'all',
  onFilterChange,
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-3 items-start sm:items-center', className)}>
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-9 py-2 text-sm rounded-xl',
            'bg-surface border border-border-subtle',
            'text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
            'transition-all duration-150'
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filters.length > 0 && onFilterChange && (
        <div className="w-full sm:w-48 shrink-0">
          <Select
            id="table-filter"
            name="table-filter"
            value={activeFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full"
          >
            {filters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────
interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalFiltered: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, totalFiltered, pageSize, onPageChange }: TablePaginationProps) {
  const from = Math.min((page - 1) * pageSize + 1, totalFiltered);
  const to = Math.min(page * pageSize, totalFiltered);

  return (
    <div className="flex items-center justify-between px-1 mt-4">
      <p className="text-xs text-text-muted">
        {totalFiltered === 0 ? 'Sin resultados' : `${from}–${to} de ${totalFiltered}`}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</PageBtn>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`ell-${i}`} className="px-2 text-text-muted text-sm">…</span>
              ) : (
                <PageBtn key={p} onClick={() => onPageChange(p as number)} active={p === page}>
                  {p}
                </PageBtn>
              )
            )}

          <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</PageBtn>
        </div>
      )}
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-[32px] h-8 px-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        active
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-surface border border-border-subtle text-text-secondary hover:border-primary-400 hover:text-text-primary',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
      )}
    >
      {children}
    </button>
  );
}

// ─── Sortable Header ─────────────────────────────────────────────────────────
interface SortableHeaderProps {
  column: string;
  sort: SortState;
  onToggle: (col: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader({ column, sort, onToggle, children, className }: SortableHeaderProps) {
  const isActive = sort.column === column;
  const dir = isActive ? sort.direction : null;

  return (
    <button
      type="button"
      onClick={() => onToggle(column)}
      className={cn(
        'flex items-center gap-1 text-left font-semibold text-text-secondary text-xs uppercase tracking-wider',
        'hover:text-text-primary transition-colors duration-150 group',
        className
      )}
    >
      {children}
      <span className={cn('transition-colors', isActive ? 'text-primary-500' : 'text-text-muted group-hover:text-text-secondary')}>
        {dir === 'asc' ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : dir === 'desc' ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}

// ─── DataTable Generic ────────────────────────────────────────────────────────
export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  sticky?: 'left' | 'right';
  cell: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> extends UseTableStateOptions<T> {
  columns: ColumnDef<T>[];
  filters?: FilterOption[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  filters,
  searchPlaceholder,
  emptyMessage = 'No se encontraron resultados',
  onRowClick,
  ...tableOptions
}: DataTableProps<T>) {
  const {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalFiltered,
    paginated,
  } = useTableState<T>(tableOptions);

  const showToolbar = filters?.length || tableOptions.searchFields?.length;

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          placeholder={searchPlaceholder}
        />
      )}

      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const stickyClass = col.sticky === 'right' 
                  ? 'sticky right-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[-4px_0_12px_rgba(0,0,0,0.05)]' 
                  : col.sticky === 'left' 
                  ? 'sticky left-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[4px_0_12px_rgba(0,0,0,0.05)]' 
                  : '';
                
                return (
                  <TableHead key={col.key} align={col.align} className={cn(stickyClass, col.className)}>
                    {col.sortable ? (
                      <SortableHeader column={col.key} sort={sort} onToggle={toggleSort}>
                        {col.header}
                      </SortableHeader>
                    ) : (
                      <span className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                        {col.header}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-text-muted">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, i) => (
                <TableRow 
                  key={(item as any).id || i} 
                  className={cn("hover:bg-surface-hover transition-colors", onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => {
                    const stickyClass = col.sticky === 'right' 
                      ? 'sticky right-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[-4px_0_12px_rgba(0,0,0,0.05)] group-hover:bg-surface-hover' 
                      : col.sticky === 'left' 
                      ? 'sticky left-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[4px_0_12px_rgba(0,0,0,0.05)] group-hover:bg-surface-hover' 
                      : '';
                      
                    return (
                      <TableCell key={col.key} align={col.align} className={cn(stickyClass, col.className)}>
                        {col.cell(item)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        pageSize={tableOptions.pageSize || 10}
        onPageChange={setPage}
      />
    </div>
  );
}
