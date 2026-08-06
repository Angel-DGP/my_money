import { Table, TableHeader, TableBody, TableRow, TableCell, Badge, Button, Icon, GoalProgress } from '@mymoney/ui';
import type { GoalDto } from '@entities/goal';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';

interface GoalsTableProps {
  goals: GoalDto[];
  onAddProgress: (goal: GoalDto) => void;
}

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Activas', value: 'active' },
  { label: 'Completadas', value: 'completed' },
];

export function GoalsTable({ goals, onAddProgress }: GoalsTableProps) {
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
  } = useTableState<GoalDto>({
    data: goals,
    pageSize: 10,
    searchFields: ['name'],
    filterField: (g, f) => {
      if (f === 'completed') return g.status === 'completed';
      if (f === 'active') return g.status !== 'completed';
      return true;
    },
    defaultSort: { column: 'name', direction: 'asc' },
    sortFn: (a, b, col, dir) => {
      let valA: any = '';
      let valB: any = '';

      if (col === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (col === 'progress_percentage') {
        valA = a.progress_percentage;
        valB = b.progress_percentage;
        return dir === 'asc' ? valA - valB : valB - valA;
      } else if (col === 'target_date') {
        valA = a.target_date ? new Date(a.target_date).getTime() : 0;
        valB = b.target_date ? new Date(b.target_date).getTime() : 0;
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
        placeholder="Buscar por nombre..."
      />

      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell asChild>
                <th>
                  <SortableHeader column="name" sort={sort} onToggle={toggleSort}>
                    Meta
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="progress_percentage" sort={sort} onToggle={toggleSort}>
                    Progreso
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Proyección</th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="target_date" sort={sort} onToggle={toggleSort}>
                    Fecha Objetivo
                  </SortableHeader>
                </th>
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
                  No se encontraron metas
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((goal) => (
                <TableRow key={goal.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {goal.icon && (
                        <span className="p-1.5 rounded-full flex shrink-0" style={{ backgroundColor: goal.color ? `${goal.color}20` : '#e2e8f0', color: goal.color || 'inherit' }}>
                          <Icon name={goal.icon as any} size="sm" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-text-primary">{goal.name}</p>
                        {goal.description && <p className="text-xs text-text-secondary font-normal truncate max-w-[150px]" title={goal.description}>{goal.description}</p>}
                      </div>
                      {goal.status === 'completed' && <Badge variant="success" className="ml-2 shrink-0">Completado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="w-1/2 min-w-[200px]">
                    <GoalProgress 
                      current={Number(goal.current_amount.value)}
                      target={Number(goal.target_amount.value)}
                      remaining={Number(goal.remaining_amount.value)}
                      percentage={goal.progress_percentage}
                      currency={goal.target_amount.currency}
                    />
                  </TableCell>
                  <TableCell>
                    {goal.status !== 'completed' && goal.days_remaining !== null ? (
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-text-primary">{goal.days_remaining} días restantes</span>
                        {goal.monthly_required && goal.monthly_required > 0 && (
                          <span className="text-xs text-text-secondary mt-0.5">
                            Req: {goal.monthly_required.toFixed(2)} {goal.target_amount.currency}/mes
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-text-secondary">
                      {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Sin fecha'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => onAddProgress(goal)}
                        disabled={goal.status === 'completed'}
                      >
                        <Icon name="plus" size="sm" className="mr-1" />
                        Aportar
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
