import { useSubscriptions, useDeleteSubscription } from '../api/useCatalogs';
import { Dialog, Modal, ModalHeader, ModalFooter, Button, Icon, PageContainer, DataTable, type ColumnDef } from '@mymoney/ui';
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
      cell: (sub) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => navigate(`/catalogs/subscriptions/${sub.id}/edit`)}>
            <Icon name="pencil" size="sm" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Eliminar" className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20" onClick={() => setSubToDelete(sub)}>
            <Icon name="trash" size="sm" />
          </Button>
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

          <Dialog.Root open={!!subToDelete} onOpenChange={(open) => !open && setSubToDelete(null)}>
            <Dialog.Portal>
              <Modal>
                <ModalHeader>
                  <Dialog.Title className="text-lg font-semibold text-text-primary">¿Eliminar suscripción?</Dialog.Title>
                  <Dialog.Description className="text-sm text-text-secondary mt-2">
                    Estás a punto de eliminar la suscripción "{subToDelete?.name}". Esta acción no se puede deshacer.
                  </Dialog.Description>
                </ModalHeader>
                <ModalFooter>
                  <Button variant="ghost" onClick={() => setSubToDelete(null)} disabled={deleteSubscription.isPending}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-error-500 hover:bg-error-600 text-white"
                    disabled={deleteSubscription.isPending}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!subToDelete) return;
                      try {
                        await deleteSubscription.mutateAsync(subToDelete.id);
                        setSubToDelete(null);
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                  >
                    {deleteSubscription.isPending ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </ModalFooter>
              </Modal>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </PageContainer.Body>
    </PageContainer>
  );
}
