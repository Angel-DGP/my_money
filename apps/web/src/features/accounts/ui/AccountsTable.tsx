import { Table, TableHeader, TableRow, TableBody, TableCell, Badge, Icon, Button, Amount } from '@mymoney/ui';
import type { Account } from '@entities/account';
import { useTableState } from '../../../shared/hooks/useTableState';
import { DataTableToolbar, SortableHeader, TablePagination } from '../../../shared/ui/DataTableToolbar';

interface AccountsTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Corriente', value: 'CHECKING' },
  { label: 'Ahorros', value: 'SAVINGS' },
  { label: 'Efectivo', value: 'CASH' },
  { label: 'Tarjeta de Crédito', value: 'CREDIT' },
  { label: 'Inversión', value: 'INVESTMENT' },
];

export function AccountsTable({ accounts, onEdit, onDelete }: AccountsTableProps) {
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
  } = useTableState<Account>({
    data: accounts,
    pageSize: 10,
    searchFields: ['name', 'type'],
    filterField: (a, f) => a.type === f,
    defaultSort: { column: 'name', direction: 'asc' },
    sortFn: (a, b, col, dir) => {
      if (col === 'current_balance.value') {
        const valA = parseFloat(a.current_balance.value);
        const valB = parseFloat(b.current_balance.value);
        return dir === 'asc' ? valA - valB : valB - valA;
      }
      const aVal = (a as any)[col];
      const bVal = (b as any)[col];
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
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
        placeholder="Buscar por nombre o tipo..."
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
              <TableCell asChild align="right">
                <th>
                  <div className="flex justify-end">
                    <SortableHeader column="current_balance.value" sort={sort} onToggle={toggleSort}>
                      Balance Actual
                    </SortableHeader>
                  </div>
                </th>
              </TableCell>
              <TableCell asChild align="right" className="font-semibold text-text-secondary text-xs uppercase tracking-wider w-24">
                <th>Acciones</th>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                  No se encontraron cuentas
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((account) => (
                <TableRow key={account.id} className="hover:bg-surface-hover transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: account.color || '#E5E7EB' }}
                      >
                        <Icon name={(account.icon as any) || 'wallet'} size="sm" className="text-white mix-blend-difference" />
                      </div>
                      <span className="font-medium text-text-primary">{account.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{account.type}</Badge>
                  </TableCell>
                  <TableCell align="right">
                    <Amount value={parseFloat(account.current_balance.value)} />
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-1">
                    <Button variant="secondary" size="icon" aria-label="Ver" className="hidden sm:inline-flex" onClick={() => onEdit(account)}>
                      <Icon name="eye" size="sm" />
                    </Button>
                    <Button variant="secondary" size="icon" aria-label="Editar" onClick={() => onEdit(account)}>
                      <Icon name="pencil" size="sm" />
                    </Button>
                    <Button variant="secondary" size="icon" className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950" aria-label="Eliminar" onClick={() => onDelete(account)}>
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
