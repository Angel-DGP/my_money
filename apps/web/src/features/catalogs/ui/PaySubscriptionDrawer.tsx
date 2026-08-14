import { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Label, DatePicker, Icon, toast } from '@mymoney/ui';
import { useAccountsQuery, AccountSelect } from '@entities/account';
import { useCards } from '../api/useCatalogs';
import { usePaySubscriptionMonth } from '../api/useCatalogs';
import type { SubscriptionDto } from '../../../shared/api/dto/catalogs.dto';

export interface PaySubscriptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionDto | null;
}

export function PaySubscriptionDrawer({
  open,
  onOpenChange,
  subscription,
}: PaySubscriptionDrawerProps) {
  const { data: accounts = [] } = useAccountsQuery();
  const { data: cards = [] } = useCards();
  const paySub = usePaySubscriptionMonth();

  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0] || '');

  // Determine matching account from subscription's card or default to first account
  const defaultAccId = useMemo(() => {
    if (!subscription) return accounts[0]?.id || '';
    if (subscription.card_id) {
      const card = cards.find((c) => c.id === subscription.card_id);
      if (card && card.institution_id) {
        const matchingAcc = accounts.find((a) => a.institution_id === card.institution_id);
        if (matchingAcc) return matchingAcc.id;
      }
    }
    return accounts[0]?.id || '';
  }, [subscription, cards, accounts]);

  useEffect(() => {
    if (open && subscription) {
      setAccountId(defaultAccId);
      setDate(new Date().toISOString().split('T')[0] || '');
    }
  }, [open, subscription, defaultAccId]);

  if (!subscription) return null;

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const amountNumber = parseFloat(subscription.amount || '0');

  const formatCurrency = (val: number, cur: string = 'USD') =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur }).format(val);

  const handleConfirmPay = async () => {
    if (!accountId) {
      toast({ title: 'Selecciona una cuenta', variant: 'error' });
      return;
    }

    if (selectedAccount && selectedAccount.type !== 'CREDIT') {
      const avail = parseFloat(selectedAccount.current_balance?.value || '0');
      if (amountNumber > avail) {
        toast({
          title: 'Saldo insuficiente',
          description: `La cuenta ${selectedAccount.name} solo tiene ${formatCurrency(avail, selectedAccount.currency)} disponibles.`,
          variant: 'error',
        });
        return;
      }
    }

    try {
      await paySub.mutateAsync({
        id: subscription.id,
        payload: { accountId, date },
      });
      toast({
        title: 'Pago registrado exitosamente',
        description: `Se debitó ${formatCurrency(amountNumber, subscription.currency)} de ${selectedAccount?.name || 'la cuenta'}.`,
        variant: 'success',
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error al registrar el pago',
        description: error.response?.data?.message || 'No se pudo procesar el débito.',
        variant: 'error',
      });
    }
  };

  const isPending = paySub.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="md">
        <Drawer.Header>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center border border-primary-500/20">
              <Icon name="credit-card" size="sm" />
            </div>
            <Drawer.Title>Registrar Pago de Suscripción</Drawer.Title>
          </div>
          <Drawer.Description>
            Confirma el débito de tu cuenta para registrar el pago de este mes y actualizar tu Flujo de Caja.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="space-y-5">
          {/* Summary Card */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                  Suscripción
                </span>
                <h4 className="text-base font-semibold text-text-primary mt-0.5">
                  {subscription.name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                  Monto a Debitar
                </span>
                <div className="text-lg font-bold text-text-primary mt-0.5">
                  {formatCurrency(amountNumber, subscription.currency)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle text-xs">
              <span className="px-2 py-0.5 rounded-md bg-surface-3 text-text-secondary font-medium">
                {subscription.billing_cycle === 'MONTHLY' ? 'Ciclo Mensual' : 'Ciclo Anual'}
              </span>
              {subscription.duration_months && (
                <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500 font-medium">
                  {subscription.pending_months !== undefined
                    ? `${subscription.pending_months} de ${subscription.duration_months} meses pendientes`
                    : `${subscription.duration_months} meses`}
                </span>
              )}
              {subscription.card && (
                <span className="px-2 py-0.5 rounded-md bg-surface-3 text-text-secondary flex items-center gap-1">
                  <Icon name="credit-card" size="xs" />
                  {subscription.card.name} (•••• {subscription.card.last_four})
                </span>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <AccountSelect
              id="pay-sub-account"
              label="Cuenta de Origen / Débito"
              required
              value={accountId}
              onChange={(val: string) => setAccountId(val)}
              disabled={isPending}
            />

            <div className="space-y-2">
              <Label htmlFor="pay-sub-date" required>
                Fecha del Pago
              </Label>
              <DatePicker
                id="pay-sub-date"
                value={date}
                onChange={(val) => setDate(val || new Date().toISOString().split('T')[0] || '')}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Info notice */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-2.5 items-start text-xs text-text-secondary">
            <Icon name="info" size="xs" className="text-blue-500 shrink-0 mt-0.5" />
            <span>
              Al confirmar, se creará el movimiento de gasto en tu historial de transacciones y la cuota correspondiente en tu Flujo de Caja se marcará como pagada.
            </span>
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmPay}
              loading={isPending}
            >
              Confirmar y Debitar
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}
