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
import { ExtendSubscriptionModal } from './ExtendSubscriptionModal';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';
import { formatDateEC } from '@shared/utils/date';

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
  const [extendSub, setExtendSub] = useState<SubscriptionDto | null>(null);
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
      cell: (sub) => formatDateEC(sub.next_billing_date),
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
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label="Reanudar / Extender proyección"
            onClick={(e) => {
              e.stopPropagation();
              setExtendSub(sub);
            }}
            className="p-1.5 text-text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
            title="Reanudar / Añadir meses en Flujo de Caja"
          >
            <Icon name="calendar" size="sm" />
          </button>
          <button
            type="button"
            aria-label="Pagar Cuota"
            disabled={sub.is_completed}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPay(sub);
            }}
            className="p-1.5 text-text-muted hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={sub.is_completed ? 'Suscripción completada / Sin meses pendientes' : 'Pagar Próximo Mes'}
          >
            <Icon name="credit-card" size="sm" />
          </button>
          <button
            type="button"
            aria-label="Ver Detalle"
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
            aria-label="Editar"
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
            aria-label="Eliminar"
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
            size="sm"
            className="px-3 sm:px-4"
            aria-label="Nueva Suscripción"
          >
            <Icon name="plus" size="sm" className="sm:mr-2" />
            <span className="hidden sm:inline">Nueva Suscripción</span>
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

        {/* Extend Subscription Modal */}
        <ExtendSubscriptionModal
          open={!!extendSub}
          onOpenChange={(open) => !open && setExtendSub(null)}
          subscription={extendSub}
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
