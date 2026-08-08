import React from 'react';
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead, Icon, Badge } from '@mymoney/ui';
import type { Category } from '@entities/category';
import { useTableState, DataTableToolbar, SortableHeader, TablePagination } from '@mymoney/ui';

interface CategoriesTableProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Gasto', value: 'EXPENSE' },
  { label: 'Ingreso', value: 'INCOME' },
];

export function CategoriesTable({ categories, onView, onEdit, onDelete }: CategoriesTableProps) {
  // Flatten categories and subcategories
  const flatCategories = React.useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const flattened: (Category & { isChild?: boolean })[] = [];
    
    categories.forEach(parent => {
      flattened.push({ ...parent, isChild: false, parentName: parent.name, parentType: parent.type } as any);
      if (parent.subcategories && parent.subcategories.length > 0) {
        parent.subcategories.forEach(child => {
          flattened.push({ ...child, isChild: true, parentName: parent.name, parentType: parent.type } as any);
        });
      }
    });
    
    return flattened;
  }, [categories]);
  
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
  } = useTableState<Category & { isChild?: boolean }>({
    data: flatCategories,
    pageSize: 10,
    searchFields: [(c: any) => c.name, (c: any) => c.isChild && c.parentName ? c.parentName : ''],
    filterField: (c, f) => c.type === f,
    sortFn: (a: any, b: any, column: string, direction: 'asc' | 'desc' | null) => {
      if (!direction) return 0;
      const dirMult = direction === 'asc' ? 1 : -1;
      
      const getVal = (item: any) => {
        if (column === 'name') {
           const rootName = item.isChild ? item.parentName : item.name;
           const childName = item.isChild ? item.name : '';
           return `${rootName}\0${childName}`;
        }
        if (column === 'type') {
           const rootType = item.isChild ? item.parentType : item.type;
           const rootName = item.isChild ? item.parentName : item.name;
           const childName = item.isChild ? item.name : '';
           return `${rootType}\0${rootName}\0${childName}`;
        }
        return String(item[column] ?? '');
      };

      return getVal(a).localeCompare(getVal(b)) * dirMult;
    }
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        placeholder="Buscar por nombre..."
      />

      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                  Nombre
                </SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="type" sort={sort} onToggle={toggleSort}>
                  Tipo
                </SortableHeader>
              </TableHead>
              <TableHead>
                <span className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Sistema
                </span>
              </TableHead>
              <TableHead align="center" className="sticky right-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[-4px_0_12px_rgba(0,0,0,0.05)] text-center">
                <span className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Acciones
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                  No se encontraron categorías
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((category) => (
                <TableRow key={category.id} className="hover:bg-surface-hover transition-colors cursor-pointer" onClick={() => onView(category)}>
                  <TableCell>
                    <div className={`flex items-center gap-3 ${category.isChild ? 'ml-8 relative before:content-[""] before:absolute before:w-4 before:h-px before:bg-border-subtle before:-left-5 before:top-1/2' : ''}`}>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: category.color || '#E5E7EB' }}
                      >
                        <Icon name={(category.icon as React.ComponentProps<typeof Icon>['name']) || 'tag'} size="sm" className="text-white" />
                      </div>
                      <span className="font-medium text-text-primary">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.type === 'EXPENSE' ? (
                      <Badge variant="error">Gasto</Badge>
                    ) : (
                      <Badge variant="success">Ingreso</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.is_system ? (
                      <Badge variant="neutral">Sistema</Badge>
                    ) : (
                      <span className="text-text-muted text-sm">Personalizada</span>
                    )}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-surface z-10 w-[140px] min-w-[140px] max-w-[140px] shadow-[-4px_0_12px_rgba(0,0,0,0.05)] group-hover:bg-surface-hover">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={(e) => { e.stopPropagation(); onView(category); }} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
                        <Icon name="eye" size="sm" />
                      </button>
                      {!category.is_system && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(category); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
                          <Icon name="edit" size="sm" />
                        </button>
                      )}
                      {!category.is_system && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(category); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
                          <Icon name="trash" size="sm" />
                        </button>
                      )}
                    </div>
                  </TableCell>
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
        pageSize={10}
        onPageChange={setPage}
      />
    </div>
  );
}
