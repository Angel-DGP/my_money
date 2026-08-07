import { Badge, Button, Icon, BudgetProgress, DataTable, type ColumnDef } from '@mymoney/ui';
import type { BudgetDto } from '@entities/budget';

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
  const columns: ColumnDef<BudgetDto>[] = [
    {
      key: 'category_name',
      header: 'Categoría',
      sortable: true,
      className: 'font-medium text-text-primary',
      cell: (budget) => (
        <>
          {categories[budget.category_id] || 'Desconocida'}
          {budget.status === 'completed' && <Badge variant="success" className="ml-2">Completado</Badge>}
        </>
      ),
    },
    {
      key: 'execution_percentage',
      header: 'Progreso',
      sortable: true,
      className: 'w-1/2 min-w-[200px]',
      cell: (budget) => (
        <BudgetProgress 
          spent={Number(budget.executed_amount.value)}
          limit={Number(budget.amount.value)}
          remaining={Number(budget.remaining_amount.value)}
          percentage={budget.execution_percentage}
          currency={budget.amount.currency}
        />
      ),
    },
    {
      key: 'proyeccion',
      header: 'Proyección',
      cell: (budget) => (
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
      ),
    },
    {
      key: 'period',
      header: 'Periodo',
      cell: (budget) => (
        <span className="capitalize text-text-secondary">{budget.period === 'monthly' ? 'Mensual' : 'Anual'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: (budget) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => onEdit(budget)}>
            <Icon name="pencil" size="sm" />
          </Button>
          <Button variant="secondary" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950" aria-label="Eliminar" onClick={() => onDelete(budget)}>
            <Icon name="trash" size="sm" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<BudgetDto>
      data={budgets}
      columns={columns}
      pageSize={10}
      searchFields={[(b) => categories[b.category_id] || '']}
      searchPlaceholder="Buscar por categoría..."
      filters={FILTERS}
      filterField={(b, f) => b.period === f}
      defaultSort={{ column: 'category_name', direction: 'asc' }}
      sortFn={(a, b, col, dir) => {
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
      }}
      emptyMessage="No se encontraron presupuestos"
    />
  );
}

