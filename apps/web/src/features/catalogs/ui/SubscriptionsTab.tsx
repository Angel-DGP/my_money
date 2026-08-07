import { useSubscriptions } from '../api/useCatalogs';
import { Button, Icon, DataTable, type ColumnDef } from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export function SubscriptionsTab() {
  const { data: subscriptions, isLoading, isError, error, refetch } = useSubscriptions();
  const navigate = useNavigate();

  const columns: ColumnDef<SubscriptionDto>[] = [
    {
      key: 'name',
      header: 'Servicio',
      sortable: true,
      className: 'font-medium',
      cell: (sub) => sub.name,
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      cell: (sub) => formatCurrency(Number(sub.amount), sub.currency),
    },
    {
      key: 'billing_cycle',
      header: 'Ciclo',
      cell: (sub) => sub.billing_cycle,
    },
    {
      key: 'next_billing_date',
      header: 'Próximo Cobro',
      sortable: true,
      cell: (sub) => new Date(sub.next_billing_date).toLocaleDateString(),
    },
    {
      key: 'card',
      header: 'Tarjeta Asoc.',
      cell: (sub) => sub.card ? `${sub.card.brand?.name || ''} **${sub.card.last_four}` : '-',
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      cell: () => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Editar">
            <Icon name="pencil" size="sm" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Suscripciones</h3>
          <p className="text-sm text-text-secondary">Administra tus pagos recurrentes y recibe alertas antes de que te cobren.</p>
        </div>
        <Button onClick={() => navigate('/catalogs/subscriptions/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Suscripción
        </Button>
      </div>

      <QueryState
        data={subscriptions}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
      >
        {() => (
          <DataTable<SubscriptionDto>
            data={subscriptions || []}
            columns={columns}
            pageSize={10}
            searchFields={['name']}
            searchPlaceholder="Buscar suscripción..."
            defaultSort={{ column: 'name', direction: 'asc' }}
            sortFn={(a, b, col, dir) => {
              let valA: any = '';
              let valB: any = '';

              if (col === 'name') {
                valA = a.name;
                valB = b.name;
              } else if (col === 'amount') {
                valA = Number(a.amount);
                valB = Number(b.amount);
                return dir === 'asc' ? valA - valB : valB - valA;
              } else if (col === 'next_billing_date') {
                valA = new Date(a.next_billing_date).getTime();
                valB = new Date(b.next_billing_date).getTime();
                return dir === 'asc' ? valA - valB : valB - valA;
              }

              const cmp = String(valA).localeCompare(String(valB));
              return dir === 'asc' ? cmp : -cmp;
            }}
            emptyMessage="No tienes suscripciones registradas."
          />
        )}
      </QueryState>
    </div>
  );
}

