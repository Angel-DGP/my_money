import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableBody, 
  TableCell, 
  Badge, 
  Icon, 
  Amount,
} from '@mymoney/ui';
import type { Transaction } from '@entities/transaction';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';

interface TransactionsTableProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Ingreso', value: 'INCOME' },
  { label: 'Gasto', value: 'EXPENSE' },
  { label: 'Transferencia', value: 'TRANSFER' },
];

export function TransactionsTable({ transactions, onTransactionClick }: TransactionsTableProps) {
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
  } = useTableState<Transaction>({
    data: transactions,
    pageSize: 10,
    searchFields: ['description', (t) => t.category?.name || ''],
    filterField: (t, f) => t.type === f,
    defaultSort: { column: 'date', direction: 'desc' },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        placeholder="Buscar por descripción o categoría..."
      />

      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Tipo</th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="description" sort={sort} onToggle={toggleSort}>
                    Descripción
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Cuenta</th>
              </TableCell>
              <TableCell asChild className="font-semibold text-text-secondary text-xs uppercase tracking-wider">
                <th>Categoría</th>
              </TableCell>
              <TableCell asChild>
                <th>
                  <SortableHeader column="date" sort={sort} onToggle={toggleSort}>
                    Fecha
                  </SortableHeader>
                </th>
              </TableCell>
              <TableCell asChild align="right">
                <th>
                  <div className="flex justify-end">
                    <SortableHeader column="amount.value" sort={sort} onToggle={toggleSort}>
                      Monto
                    </SortableHeader>
                  </div>
                </th>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                  No se encontraron transacciones
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow 
                  key={t.id} 
                  className="cursor-pointer hover:bg-surface-hover transition-colors"
                  onClick={() => onTransactionClick(t)}
                >
                  <TableCell>
                    {t.type === 'INCOME' ? (
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
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-text-primary">
                    {t.description || 'Sin descripción'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-surface-hover">
                        <Icon name={(t.account?.icon as any) || 'wallet'} size="xs" className="text-text-secondary" />
                      </div>
                      <span className="text-sm text-text-secondary">{t.account?.name || '---'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {t.category ? (
                      <Badge variant="neutral" className="gap-1">
                        {t.category.icon && <Icon name={t.category.icon as any} size="xs" />}
                        {t.category.name}
                      </Badge>
                    ) : (
                      <span className="text-text-muted text-sm">---</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell align="right">
                    <Amount 
                      value={parseFloat(t.amount.value)} 
                      currency={t.amount.currency}
                      className={t.type === 'INCOME' ? 'text-success-600 dark:text-success-500' : 'text-text-primary'}
                    />
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
