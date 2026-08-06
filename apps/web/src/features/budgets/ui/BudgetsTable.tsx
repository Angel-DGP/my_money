import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, Button, Icon, BudgetProgress } from '@mymoney/ui';
import type { BudgetDto } from '@entities/budget';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';

interface BudgetsTableProps {
  budgets: BudgetDto[];
  onEdit: (budget: BudgetDto) => void;
  onDelete: (budget: BudgetDto) => void;
  categories: Record<string, string>; // Map category_id to name
}

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
];

export function BudgetsTable({ budgets, onEdit, onDelete, categories }: BudgetsTableProps) {
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
  } = useTableState<BudgetDto>({
    data: budgets,
    pageSize: 10,
    searchFields: [(b) => categories[b.category_id] || ''],
    filterField: (b, f) => b.period === f,
    defaultSort: { column: 'category_name', direction: 'asc' },
    sortFn: (a, b, col, dir) => {
      let valA: any = '';
      let valB: any = '';
      
      if (col === 'category_name') {
        valA = categories[a.category_id] || '';
        valB = categories[b.category_id] || '';
      } else if (col === 'execution_percentage') {
        valA = a.execution_percentage;
        valB = b.execution_percentage;
        return dir === 'asc' ? valA - valB : valB - valA;
      }

      const cmp = String(valA).localeCompare(String(valB));
      return dir === 'asc' ? cmp : -cmp;
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
        placeholder="Buscar por categoría..."
      />

      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell asChild>
                <th>
                  <SortableHeader column="category_name" sort={sort} onToggle={toggleSort}>
                    Categoría
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="execution_percentage" sort={sort} onToggle={toggleSort}>
                    Progreso
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Proyección</th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Periodo</th>
              </TableCell>
              <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Acciones</th>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-muted">
                  No se encontraron presupuestos
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((budget) => (
                <TableRow key={budget.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell className="font-medium text-text-primary">
                    {categories[budget.category_id] || 'Desconocida'}
                    {budget.status === 'completed' && <Badge variant="success" className="ml-2">Completado</Badge>}
                  </TableCell>
                  <TableCell className="w-1/2 min-w-[200px]">
                    <BudgetProgress 
                      spent={Number(budget.executed_amount.value)}
                      limit={Number(budget.amount.value)}
                      remaining={Number(budget.remaining_amount.value)}
                      percentage={budget.execution_percentage}
                      currency={budget.amount.currency}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-text-secondary">Gasto diario: {budget.daily_actual_velocity.value}</span>
                      <span className="text-text-secondary">Proyección: {budget.projected_end_amount.value}</span>
                      <Badge 
                        variant={budget.status_indicator === 'ACCELERATED' ? 'error' : budget.status_indicator === 'SLOW' ? 'success' : 'neutral'} 
                        className="w-fit mt-1 text-[10px]"
                      >
                        {budget.status_indicator === 'ACCELERATED' ? 'Rápido' : budget.status_indicator === 'SLOW' ? 'Ahorro' : 'Normal'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-text-secondary">{budget.period === 'monthly' ? 'Mensual' : 'Anual'}</span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => onEdit(budget)}>
                      <Icon name="pencil" size="sm" />
                    </Button>
                    <Button variant="secondary" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950" aria-label="Eliminar" onClick={() => onDelete(budget)}>
                      <Icon name="trash" size="sm" />
                    </Button>
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
