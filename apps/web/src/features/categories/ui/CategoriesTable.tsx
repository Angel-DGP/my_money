import { Table, TableHeader, TableRow, TableBody, TableCell, Icon, Button, Badge } from '@mymoney/ui';
import type { Category } from '@entities/category';
import { useTableState, DataTableToolbar, SortableHeader, TablePagination } from '@mymoney/ui';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Gasto', value: 'EXPENSE' },
  { label: 'Ingreso', value: 'INCOME' },
];

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  
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
  } = useTableState<Category>({
    data: safeCategories,
    pageSize: 10,
    searchFields: ['name'],
    filterField: (c, f) => c.type === f,
    defaultSort: { column: 'name', direction: 'asc' },
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
              <TableCell asChild>
                <th>
                  <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                    Nombre
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="type" sort={sort} onToggle={toggleSort}>
                    Tipo
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Sistema</th>
              </TableCell>
              <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Acciones</th>
              </TableCell>
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
                <TableRow key={category.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#E5E7EB' }}
                      >
                        <Icon name={(category.icon as React.ComponentProps<typeof Icon>['name']) || 'tag'} size="sm" className="text-white mix-blend-difference" />
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
                  <TableCell className="text-right flex items-center justify-end gap-1">
                      <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => onEdit(category)}>
                        <Icon name="pencil" size="sm" />
                      </Button>
                      {!category.is_system && (
                        <Button variant="secondary" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950" aria-label="Eliminar" onClick={() => onDelete(category)}>
                          <Icon name="trash" size="sm" />
                        </Button>
                      )}
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
