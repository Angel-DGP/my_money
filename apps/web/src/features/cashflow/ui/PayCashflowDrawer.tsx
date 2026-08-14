import { useState, useEffect } from 'react';
import { Drawer, Button, Select, Label, DatePicker, Icon, toast } from '@mymoney/ui';
import { useAccountsQuery } from '@entities/account';
import { usePayCashflowEvent, useUpdateCashflowEventStatus } from '../api/useCashflow';
import type { CashflowEvent } from '../../../shared/api/services/cashflow';

export interface PayCashflowDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CashflowEvent | null;
  defaultAccountId?: string | undefined;
}

export function PayCashflowDrawer({
  open,
  onOpenChange,
  event,
  defaultAccountId,
}: PayCashflowDrawerProps) {
  const { data: accounts = [] } = useAccountsQuery();
  const payEvent = usePayCashflowEvent();
  const updateStatus = useUpdateCashflowEventStatus();

  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0] || '');

  useEffect(() => {
    if (open && event) {
      const initialAcc = defaultAccountId || accounts[0]?.id || '';
      setAccountId(initialAcc);
      setDate(new Date().toISOString().split('T')[0] || '');
    }
  }, [open, event, defaultAccountId, accounts]);

  if (!event) return null;

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const amountNumber = parseFloat(event.amount);

  const formatCurrency = (val: number, cur: string = 'USD') =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: cur }).format(val);

  const handlePayWithTransaction = async () => {
    if (!accountId) {
      toast({ title: 'Selecciona una cuenta', variant: 'error' });
      return;
    }

    try {
      await payEvent.mutateAsync({
        id: event.id,
        payload: { accountId, date },
      });
      toast({
        title: 'Pago registrado exitosamente',
        description: `Se debitó ${formatCurrency(amountNumber)} de ${selectedAccount?.name || 'la cuenta'}.`,
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

  const handleMarkPaidOnly = async () => {
    try {
      await updateStatus.mutateAsync({ id: event.id, status: 'PAID' });
      toast({
        title: 'Marcada como pagada',
        description: 'Se actualizó el estado sin registrar transacción ni débito.',
        variant: 'success',
      });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al actualizar', variant: 'error' });
    }
  };

  const isPending = payEvent.isPending || updateStatus.isPending;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content size="md">
        <Drawer.Header>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Icon name="credit-card" size="sm" />
            </div>
            <Drawer.Title>Registrar Pago de Cuota</Drawer.Title>
          </div>
          <Drawer.Description>
            Confirma el débito de tu cuenta para registrar la transacción real de este movimiento.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="space-y-6 py-4">
          {/* Card resumen del movimiento */}
          <div className="p-4 rounded-2xl bg-surface-2/40 border border-border-subtle flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface text-[10px] font-bold text-text-secondary border border-border-subtle uppercase tracking-wider">
                {event.source_type}
              </span>
              <p className="text-sm font-bold text-text-primary mt-1">
                {event.description || 'Gasto proyectado'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Monto a Pagar</p>
              <p className="text-xl font-black text-amber-500">
                {formatCurrency(amountNumber)}
              </p>
            </div>
          </div>

          {/* Selector de cuenta */}
          <div className="space-y-2">
            <Label htmlFor="pay-drawer-account" required>
              Cuenta de Pago / Débito
            </Label>
            <Select
              id="pay-drawer-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isPending}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Saldo: {formatCurrency(parseFloat(acc.current_balance?.value || '0'), acc.currency)}
                </option>
              ))}
            </Select>
            {selectedAccount && (
              <div className="text-xs text-text-muted flex items-center justify-between pt-1 px-1">
                <span>Disponible después del pago:</span>
                <span className={`font-semibold ${
                  parseFloat(selectedAccount.current_balance?.value || '0') - amountNumber < 0
                    ? 'text-rose-500'
                    : 'text-text-primary'
                }`}>
                  {formatCurrency(
                    parseFloat(selectedAccount.current_balance?.value || '0') - amountNumber,
                    selectedAccount.currency
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Fecha de pago */}
          <div className="space-y-2">
            <DatePicker
              id="pay-drawer-date"
              label="Fecha de Pago"
              value={date}
              onChange={(val) => setDate(val || '')}
              disabled={isPending}
            />
          </div>
        </Drawer.Body>

        <Drawer.Footer className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-auto"
          >
            Cancelar
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleMarkPaidOnly}
              disabled={isPending}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              Solo marcar pagada
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePayWithTransaction}
              loading={isPending}
              className="font-semibold"
            >
              <Icon name="check" size="xs" className="mr-1.5" />
              Confirmar y Debitar
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}
