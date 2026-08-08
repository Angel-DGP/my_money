import { Badge, Icon, GoalProgress, DataTable, type ColumnDef } from '@mymoney/ui';
import type { GoalDto } from '@entities/goal';

interface GoalsTableProps {
  goals: GoalDto[];
  onView: (goal: GoalDto) => void;
  onEdit: (goal: GoalDto) => void;
  onDelete: (goal: GoalDto) => void;
  onAddProgress: (goal: GoalDto) => void;
}

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Activas', value: 'active' },
  { label: 'Completadas', value: 'completed' },
];

export function GoalsTable({ goals, onView, onEdit, onDelete, onAddProgress }: GoalsTableProps) {
  const columns: ColumnDef<GoalDto>[] = [
    {
      key: 'name',
      header: 'Meta',
      sortable: true,
      cell: (goal) => (
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
      ),
    },
    {
      key: 'progress_percentage',
      header: 'Progreso',
      sortable: true,
      className: 'w-1/2 min-w-[200px]',
      cell: (goal) => (
        <GoalProgress 
          current={Number(goal.current_amount.value)}
          target={Number(goal.target_amount.value)}
          remaining={Number(goal.remaining_amount.value)}
          percentage={goal.progress_percentage}
          currency={goal.target_amount.currency}
        />
      ),
    },
    {
      key: 'proyeccion',
      header: 'Proyección',
      cell: (goal) => (
        goal.status !== 'completed' && goal.days_remaining !== null ? (
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
        )
      ),
    },
    {
      key: 'target_date',
      header: 'Fecha Objetivo',
      sortable: true,
      cell: (goal) => (
        <span className="text-sm text-text-secondary">
          {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Sin fecha'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (goal) => (
        <div className="flex justify-center gap-1">
          <button type="button" aria-label="Aportar" disabled={goal.status === 'completed'} onClick={(e) => { e.stopPropagation(); onAddProgress(goal); }} className="p-1.5 text-text-muted hover:text-success-500 hover:bg-success-50 dark:hover:bg-success-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon name="piggy-bank" size="sm" />
          </button>
          <button type="button" aria-label="Ver" onClick={(e) => { e.stopPropagation(); onView(goal); }} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" aria-label="Editar" onClick={(e) => { e.stopPropagation(); onEdit(goal); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" aria-label="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(goal); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<GoalDto>
      data={goals}
      columns={columns}
      pageSize={10}
      searchFields={['name']}
      searchPlaceholder="Buscar por nombre..."
      filters={FILTERS}
      filterField={(g, f) => {
        if (f === 'completed') return g.status === 'completed';
        if (f === 'active') return g.status !== 'completed';
        return true;
      }}
      defaultSort={{ column: 'name', direction: 'asc' }}
      sortFn={(a, b, col, dir) => {
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
      }}
      onRowClick={onView}
      emptyMessage="No se encontraron metas"
    />
  );
}

