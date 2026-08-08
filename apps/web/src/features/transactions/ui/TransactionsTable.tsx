import { Badge, Icon, Amount, DataTable, type ColumnDef } from '@mymoney/ui';
import type { Transaction } from '@entities/transaction';

interface TransactionsTableProps {
  transactions: Transaction[];
  onView: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Ingreso', value: 'INCOME' },
  { label: 'Gasto', value: 'EXPENSE' },
  { label: 'Transferencia', value: 'TRANSFER' },
];

export function TransactionsTable({ transactions, onView, onEdit, onDelete }: TransactionsTableProps) {
  const columns: ColumnDef<Transaction>[] = [
    {
      key: 'type',
      header: 'Tipo',
      cell: (t) => (
        t.type === 'INCOME' ? (
          <Badge variant="success" className="gap-1 px-2 py-0.5">
            <Icon name="arrow-down-left" size="xs" /> Ingreso
          </Badge>
        ) : t.type === 'EXPENSE' ? (
          <Badge variant="error" className="gap-1 px-2 py-0.5 bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400">
            <Icon name="arrow-up-right" size="xs" /> Gasto
          </Badge>
        ) : (
          <Badge variant="neutral" className="gap-1 px-2 py-0.5">
            <Icon name="arrow-left-right" size="xs" /> Transferencia
          </Badge>
        )
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      sortable: true,
      className: 'font-medium text-text-primary',
      cell: (t) => t.description || 'Sin descripción',
    },
    {
      key: 'account',
      header: 'Cuenta',
      cell: (t) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-surface-hover">
            <Icon name={(t.account?.icon as any) || 'wallet'} size="xs" className="text-text-secondary" />
          </div>
          <span className="text-sm text-text-secondary">{t.account?.name || '---'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      cell: (t) => (
        t.category ? (
          <Badge variant="neutral" className="gap-1">
            {t.category.icon && <Icon name={t.category.icon as any} size="xs" />}
            {t.category.name}
          </Badge>
        ) : (
          <span className="text-text-muted text-sm">---</span>
        )
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      sortable: true,
      className: 'text-sm text-text-secondary',
      cell: (t) => new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      key: 'amount.value',
      header: 'Monto',
      sortable: true,
      align: 'right',
      cell: (t) => (
        <Amount 
          value={parseFloat(t.amount.value)} 
          currency={t.amount.currency}
          className={t.type === 'INCOME' ? 'text-success-600 dark:text-success-500' : 'text-text-primary'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (t) => (
        <div className="flex justify-center gap-1">
          <button type="button" onClick={(e) => { e.stopPropagation(); onView(t); }} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(t); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Transaction>
      data={transactions}
      columns={columns}
      pageSize={10}
      searchFields={['description', (t) => t.category?.name || '']}
      searchPlaceholder="Buscar por descripción o categoría..."
      filters={FILTERS}
      filterField={(t, f) => t.type === f}
      defaultSort={{ column: 'date', direction: 'desc' }}
      onRowClick={onView}
      emptyMessage="No se encontraron transacciones"
    />
  );
}

