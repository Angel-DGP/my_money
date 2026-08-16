import { useState, useEffect } from 'react';
import {
  Dialog,
  Modal,
  ModalHeader,
  ModalFooter,
  Button,
  DatePicker,
  NumberInput,
  Icon,
  Badge,
  toast,
} from '@mymoney/ui';
import { useExtendSubscription } from '../api/useCatalogs';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';
import { getEcuadorTodayString } from '@shared/utils/date';

export interface ExtendSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionDto | null;
}

export function ExtendSubscriptionModal({
  open,
  onOpenChange,
  subscription,
}: ExtendSubscriptionModalProps) {
  const extendSubscription = useExtendSubscription();
  const [startDate, setStartDate] = useState<string>(getEcuadorTodayString());
  const [months, setMonths] = useState<number>(2);

  useEffect(() => {
    if (open && subscription) {
      setStartDate(getEcuadorTodayString());
      setMonths(subscription.billing_cycle === 'YEARLY' ? 1 : 2);
    }
  }, [open, subscription]);

  if (!subscription) return null;

  const formatCurrency = (val: number, cur: string = 'USD') =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur }).format(val);

  const amountNumber = Number(subscription.amount) || 0;

  const handleExtend = async () => {
    if (!startDate) {
      toast({ title: 'Indica la fecha de inicio', variant: 'error' });
      return;
    }

    if (!months || months < 1) {
      toast({ title: 'Indica al menos 1 mes a proyectar', variant: 'error' });
      return;
    }

    try {
      await extendSubscription.mutateAsync({
        id: subscription.id,
        data: {
          start_date: startDate,
          months: Number(months),
        },
      });

      toast({
        title: 'Proyección extendida exitosamente',
        description: `Se han añadido ${months} ${months === 1 ? 'cuota' : 'cuotas'} al Flujo de Caja para ${subscription.name}.`,
        variant: 'success',
      });

      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error al extender suscripción',
        description: error.response?.data?.message || 'No se pudieron generar los meses proyectados.',
        variant: 'error',
      });
    }
  };

  const isPending = extendSubscription.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Modal className="max-w-md">
          <ModalHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
                <Icon name="calendar" size="sm" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-text-primary">
                  Reanudar / Extender Proyección
                </Dialog.Title>
                <Dialog.Description className="text-xs text-text-muted">
                  Añade nuevas cuotas en tu Flujo de Caja manteniendo tu historial previo intacto.
                </Dialog.Description>
              </div>
            </div>
          </ModalHeader>

          <div className="space-y-4 py-2">
            {/* Subscription Summary Card */}
            <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-2/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center shadow-xs">
                    <Icon name="repeat" size="xs" className="text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">{subscription.name}</h4>
                    <p className="text-xs text-text-muted">
                      {subscription.category?.name || 'Suscripción'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-text-primary">
                    {formatCurrency(amountNumber, subscription.currency)}
                  </span>
                  <p className="text-[11px] text-text-muted">
                    {subscription.billing_cycle === 'MONTHLY' ? '/ mes' : '/ año'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs border-t border-border-subtle/50">
                <Badge variant={subscription.is_completed ? 'neutral' : 'success'} size="sm">
                  {subscription.is_completed ? 'Completada / Pausada' : 'Activa'}
                </Badge>
                {subscription.card && (
                  <span className="text-text-muted flex items-center gap-1 text-[11px]">
                    <Icon name="credit-card" size="xs" /> {subscription.card.name} (•••• {subscription.card.last_four})
                  </span>
                )}
              </div>
            </div>

            {/* Fecha de inicio */}
            <div className="space-y-1.5">
              <DatePicker
                id="extend-sub-date"
                label="Fecha de Inicio / Reactivación"
                required
                value={startDate}
                onChange={(d) => setStartDate(d || getEcuadorTodayString())}
                disabled={isPending}
              />
              <p className="text-[11px] text-text-muted">
                Primer mes donde se proyectará el cobro en Flujo de Caja.
              </p>
            </div>

            {/* Cantidad de meses */}
            <div className="space-y-1.5">
              <NumberInput
                id="extend-sub-months"
                label={subscription.billing_cycle === 'YEARLY' ? 'Años a Proyectar' : 'Meses a Proyectar en Flujo de Caja'}
                min={1}
                max={36}
                suffix={subscription.billing_cycle === 'YEARLY' ? 'años' : 'meses'}
                placeholder="Ej. 2"
                required
                value={months}
                onChange={(val) => setMonths(val ?? 1)}
                disabled={isPending}
              />
              <p className="text-[11px] text-text-muted">
                Se generarán {months} {months === 1 ? 'movimiento proyectado' : 'movimientos proyectados'} en los meses correspondientes.
              </p>
            </div>
          </div>

          <ModalFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleExtend}
              loading={isPending}
              className="font-semibold"
            >
              <Icon name="check" size="xs" className="mr-1.5" />
              Confirmar y Proyectar
            </Button>
          </ModalFooter>
        </Modal>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
