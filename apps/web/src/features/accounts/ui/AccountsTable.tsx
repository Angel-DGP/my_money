import { DataTable, Icon, type IconName, Badge, Amount, type ColumnDef } from '@mymoney/ui';
import type { Account } from '@entities/account';

interface AccountsTableProps {
  accounts: Account[];
  onView: (account: Account) => void;
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

import { useNavigate } from 'react-router-dom';

export function AccountsTable({ accounts, onView, onEdit, onDelete }: AccountsTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<Account>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      cell: (account) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: account.color || '#E5E7EB' }}
          >
            <Icon name={(account.icon as IconName) || 'wallet'} size="sm" className="text-white mix-blend-difference" />
          </div>
          <span className="font-medium text-text-primary">{account.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      cell: (account) => <Badge variant="neutral">{account.type}</Badge>,
    },
    {
      key: 'current_balance.value',
      header: 'Balance Actual',
      sortable: true,
      align: 'right',
      cell: (account) => <Amount value={parseFloat(account.current_balance.value)} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (account) => (
        <div className="flex justify-center gap-1">
          <button 
            type="button" 
            title="Ver transacciones de esta cuenta"
            aria-label="Ver transacciones"
            onClick={(e) => { e.stopPropagation(); navigate(`/transactions?accountId=${account.id}`); }} 
            className="p-1.5 text-text-muted hover:text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-md transition-colors"
          >
            <Icon name="arrow-left-right" size="sm" />
          </button>
          <button type="button" title="Ver detalle" aria-label="Ver detalle" onClick={(e) => { e.stopPropagation(); onView(account); }} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" title="Editar cuenta" aria-label="Editar cuenta" onClick={(e) => { e.stopPropagation(); onEdit(account); }} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" title="Eliminar cuenta" aria-label="Eliminar cuenta" onClick={(e) => { e.stopPropagation(); onDelete(account); }} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Account>
      data={accounts}
      columns={columns}
      pageSize={10}
      searchFields={['name', 'type']}
      searchPlaceholder="Buscar por nombre o tipo..."
      filters={FILTERS}
      filterField={(a, f) => a.type === f}
      defaultSort={{ column: 'name', direction: 'asc' }}
      sortFn={(a, b, col, dir) => {
        if (col === 'current_balance.value') {
          const valA = parseFloat(a.current_balance.value);
          const valB = parseFloat(b.current_balance.value);
          return dir === 'asc' ? valA - valB : valB - valA;
        }
        const aVal = (a as unknown as Record<string, unknown>)[col];
        const bVal = (b as unknown as Record<string, unknown>)[col];
        const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
        return dir === 'asc' ? cmp : -cmp;
      }}
      onRowClick={onView}
      emptyMessage="No se encontraron cuentas"
    />
  );
}

