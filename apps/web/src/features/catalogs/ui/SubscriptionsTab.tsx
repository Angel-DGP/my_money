import { useState } from 'react';
import { useSubscriptions, useDeleteSubscription } from '../api/useCatalogs';
import {
  AlertDialog,
  Button,
  Icon,
  PageContainer,
  DataTable,
  type ColumnDef,
} from '@mymoney/ui';
import { QueryState } from '../../../shared/ui/QueryState';
import { SubscriptionDrawer } from './SubscriptionDrawer';
import { PaySubscriptionDrawer } from './PaySubscriptionDrawer';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(value);
};

export function SubscriptionsTab() {
  const { data: subscriptions, isLoading, isError, error, refetch } = useSubscriptions();
  const deleteSubscription = useDeleteSubscription();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubscriptionDto | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [subToDelete, setSubToDelete] = useState<SubscriptionDto | null>(null);

  const handleOpenCreate = () => {
    setSelectedSub(null);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (sub: SubscriptionDto) => {
    setSelectedSub(sub);
    setIsViewMode(false);
    setDrawerOpen(true);
  };

  const handleOpenView = (sub: SubscriptionDto) => {
    setSelectedSub(sub);
    setIsViewMode(true);
    setDrawerOpen(true);
  };

  const handleOpenPay = (sub: SubscriptionDto) => {
    setSelectedSub(sub);
    setPayDrawerOpen(true);
  };

  const columns: ColumnDef<SubscriptionDto>[] = [
    {
      key: 'name',
      header: 'Servicio',
      sortable: true,
      className: 'font-medium',
      cell: (sub) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{sub.name}</span>
          {sub.duration_months && (
            <span className="text-xs text-text-muted">
              {sub.is_completed ? (
                <span className="text-emerald-500 font-medium">Completada ({sub.duration_months} meses)</span>
              ) : (
                <span>
                  {sub.pending_months !== undefined
                    ? `${sub.pending_months} de ${sub.duration_months} meses pendientes`
                    : `${sub.duration_months} meses proyectados`}
                </span>
              )}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      cell: (sub) => (
        <span className="font-semibold text-text-primary">
          {formatCurrency(Number(sub.amount), sub.currency)}
        </span>
      ),
    },
    {
      key: 'billing_cycle',
      header: 'Ciclo',
      cell: (sub) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-secondary border border-border-subtle">
          {sub.billing_cycle === 'MONTHLY' ? 'Mensual' : 'Anual'}
        </span>
      ),
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
      cell: (sub) =>
        sub.card ? (
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Icon name="credit-card" size="xs" />
            {sub.card.name} (•••• {sub.card.last_four})
          </span>
        ) : (
          <span className="text-text-muted text-xs">Sin tarjeta (Efectivo)</span>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      sticky: 'right',
      cell: (sub) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="xs"
            variant="secondary"
            disabled={sub.is_completed}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPay(sub);
            }}
            className={`text-xs px-2.5 py-1 rounded-lg ${
              sub.is_completed ? 'opacity-40' : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            title={sub.is_completed ? 'Suscripción pagada en su totalidad' : 'Pagar próximo mes'}
          >
            <Icon name="credit-card" size="xs" className="mr-1" />
            {sub.is_completed ? 'Pagada' : 'Pagar Mes'}
          </Button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenView(sub);
            }}
            className="p-1.5 text-text-muted hover:text-primary-500 hover:bg-surface-2 rounded-lg transition-colors"
            title="Ver Detalle"
          >
            <Icon name="eye" size="sm" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(sub);
            }}
            className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-surface-2 rounded-lg transition-colors"
            title="Editar"
          >
            <Icon name="edit" size="sm" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSubToDelete(sub);
            }}
            className="p-1.5 text-text-muted hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageContainer.Header
        title="Suscripciones y Servicios Recurrentes"
        description="Gestiona pagos fijos recurrentes (streaming, software, membresías)."
        actions={
          <Button
            onClick={handleOpenCreate}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <Icon name="plus" size="xs" className="mr-1.5" />
            Nueva Suscripción
          </Button>
        }
      />
      <PageContainer.Body variant="transparent">
        <QueryState
          data={subscriptions}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
        >
          {() => (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <DataTable<SubscriptionDto>
                data={subscriptions || []}
                columns={columns}
                pageSize={10}
                searchFields={['name', 'billing_cycle']}
                searchPlaceholder="Buscar suscripción..."
                defaultSort={{ column: 'name', direction: 'asc' }}
                onRowClick={(sub) => handleOpenView(sub)}
                emptyMessage="No tienes suscripciones registradas."
              />
            </div>
          )}
        </QueryState>

        {/* Subscription Drawer */}
        <SubscriptionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          subscription={selectedSub}
          isView={isViewMode}
        />

        {/* Pay Subscription Drawer */}
        <PaySubscriptionDrawer
          open={payDrawerOpen}
          onOpenChange={setPayDrawerOpen}
          subscription={selectedSub}
        />

        {/* Delete Dialog */}
        <AlertDialog
          open={!!subToDelete}
          onOpenChange={(open) => !open && setSubToDelete(null)}
          title="¿Eliminar suscripción?"
          description={`Estás a punto de eliminar la suscripción "${subToDelete?.name}".`}
          type="error"
          confirmText="Eliminar"
          isLoading={deleteSubscription.isPending}
          onConfirm={async () => {
            if (!subToDelete) return;
            try {
              await deleteSubscription.mutateAsync(subToDelete.id);
              setSubToDelete(null);
            } catch (err) {
              console.error('Error al eliminar la suscripción', err);
            }
          }}
        />
      </PageContainer.Body>
    </PageContainer>
  );
}
