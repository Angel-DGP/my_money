import { useSubscriptions, useDeleteSubscription } from '../api/useCatalogs';
import { AlertDialog, Button, Icon, PageContainer, DataTable, type ColumnDef } from '@mymoney/ui';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { QueryState } from '../../../shared/ui/QueryState';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export function SubscriptionsTab() {
  const { data: subscriptions, isLoading, isError, error, refetch } = useSubscriptions();
  const deleteSubscription = useDeleteSubscription();
  const navigate = useNavigate();
  const [subToDelete, setSubToDelete] = useState<SubscriptionDto | null>(null);

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
      sticky: 'right',
      cell: (sub) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => navigate(`/catalogs/subscriptions/${sub.id}/edit`, { state: { isView: true } })} className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors">
            <Icon name="eye" size="sm" />
          </button>
          <button type="button" onClick={() => navigate(`/catalogs/subscriptions/${sub.id}/edit`)} className="p-1.5 text-text-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors">
            <Icon name="edit" size="sm" />
          </button>
          <button type="button" onClick={() => setSubToDelete(sub)} className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-md transition-colors">
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageContainer.Header
        title="Suscripciones"
        description="Lleva el control de tus servicios recurrentes (Netflix, Spotify, gimnasio)."
        actions={
          <Button onClick={() => navigate('/catalogs/subscriptions/new')} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nueva Suscripción
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
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
                  if (col === 'name') {
                    const valA = a.name;
                    const valB = b.name;
                    const cmp = valA.localeCompare(valB);
                    return dir === 'asc' ? cmp : -cmp;
                  } else if (col === 'amount') {
                    const valA = Number(a.amount);
                    const valB = Number(b.amount);
                    return dir === 'asc' ? valA - valB : valB - valA;
                  } else if (col === 'next_billing_date') {
                    const valA = new Date(a.next_billing_date).getTime();
                    const valB = new Date(b.next_billing_date).getTime();
                    return dir === 'asc' ? valA - valB : valB - valA;
                  }
                  return 0;
                }}
                onRowClick={(sub) => navigate(`/catalogs/subscriptions/${sub.id}/edit`, { state: { isView: true } })}
                emptyMessage="No tienes suscripciones registradas."
              />
            )}
          </QueryState>

          <AlertDialog
            open={!!subToDelete}
            onOpenChange={(open) => !open && setSubToDelete(null)}
            title="¿Eliminar suscripción?"
            description={`Estás a punto de eliminar la suscripción "${subToDelete?.name}". Esta acción no se puede deshacer.`}
            type="error"
            confirmText="Eliminar"
            isLoading={deleteSubscription.isPending}
            onConfirm={async () => {
              if (!subToDelete) return;
              try {
                await deleteSubscription.mutateAsync(subToDelete.id);
                setSubToDelete(null);
              } catch (error) {
                console.error(error);
              }
            }}
          />
        </div>
      </PageContainer.Body>
    </PageContainer>
  );
}
