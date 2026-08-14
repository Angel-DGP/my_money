import { useState, useEffect, useMemo } from 'react';
import { Button, Label, FormLayout, NumberInput, Select, Icon } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import type { AddGoalProgressDto } from '@entities/goal';

interface AddProgressFormProps {
  goalName: string;
  defaultCurrency: string;
  defaultAccountId?: string | null;
  onSubmit: (data: AddGoalProgressDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
};

export function AddProgressForm({
  goalName,
  defaultCurrency,
  defaultAccountId,
  onSubmit,
  onCancel,
  isLoading,
}: AddProgressFormProps) {
  const { data: accountsResponse, isLoading: isLoadingAccounts } = useAccountsQuery();
  const accounts: Account[] = useMemo(() => (Array.isArray(accountsResponse) ? accountsResponse : []), [accountsResponse]);

  const [formData, setFormData] = useState({
    amount: 0,
    currency: defaultCurrency,
    accountId: defaultAccountId || '',
  });

  // Auto-select first account if not set
  useEffect(() => {
    if (!formData.accountId && accounts.length > 0) {
      // Prefer account matching goal currency or defaultAccountId
      const matchingAccount = accounts.find((a) => a.currency === defaultCurrency) || accounts[0];
      if (matchingAccount) {
        setFormData((prev) => ({
          ...prev,
          accountId: matchingAccount.id,
          currency: matchingAccount.currency,
        }));
      }
    }
  }, [accounts, defaultCurrency, formData.accountId]);

  const selectedAccount = accounts.find((a) => a.id === formData.accountId);
  const availableBalance = selectedAccount ? parseFloat(selectedAccount.current_balance.value) || 0 : 0;
  const isOverBalance = selectedAccount ? formData.amount > availableBalance : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || formData.amount <= 0 || isOverBalance) return;

    onSubmit({
      amount: formData.amount,
      currency: formData.currency,
      accountId: formData.accountId,
    });
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${formatCurrency(parseFloat(acc.current_balance.value) || 0, acc.currency)})`,
  }));

  return (
    <FormLayout id="addprogressform-form" onSubmit={handleSubmit}>
      {/* Goal Target Banner */}
      <div className="col-span-12 p-3.5 rounded-xl bg-surface-2/60 border border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
            <Icon name="target" size="sm" />
          </div>
          <div>
            <span className="text-xs text-text-muted block">Aportando a meta</span>
            <span className="text-sm font-bold text-text-primary">{goalName}</span>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-surface text-text-secondary border border-border-subtle">
          {defaultCurrency}
        </span>
      </div>

      {/* Account Selector */}
      <div className="col-span-12 space-y-2">
        <Label htmlFor="accountId" required>Cuenta de Origen (De donde sale el dinero)</Label>
        <Select
          id="accountId"
          options={accountOptions}
          value={formData.accountId}
          onChange={(e) => {
            const val = typeof e === 'string' ? e : e?.target?.value || '';
            const acc = accounts.find((a) => a.id === val);
            setFormData((prev) => ({
              ...prev,
              accountId: val,
              currency: acc?.currency || prev.currency,
            }));
          }}
          disabled={isLoadingAccounts || isLoading}
          placeholder="Selecciona una cuenta..."
        />
        {selectedAccount && (
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <span className="text-text-muted">Saldo disponible:</span>
            <span className={`font-semibold ${availableBalance <= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {formatCurrency(availableBalance, selectedAccount.currency)}
            </span>
          </div>
        )}
      </div>

      {/* Amount to Contribute */}
      <div className="col-span-12 space-y-2">
        <NumberInput
          id="amount"
          name="amount"
          label="Monto a Aportar"
          prefix="$"
          step={10}
          min={0.01}
          max={availableBalance > 0 ? availableBalance : undefined}
          value={formData.amount}
          onChange={(val) => setFormData((prev) => ({ ...prev, amount: val || 0 }))}
          disabled={!formData.accountId || isLoading}
          required
          placeholder="0.00"
          error={isOverBalance ? `El monto supera el saldo disponible (${formatCurrency(availableBalance, selectedAccount?.currency)})` : undefined}
        />
      </div>

      {/* Insufficient Funds Warning Banner */}
      {isOverBalance && (
        <div className="col-span-12 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <Icon name="alert-triangle" size="xs" className="shrink-0" />
          <span>No cuentas con saldo suficiente en esta cuenta para completar este aporte.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 mt-4 col-span-12 border-t border-border-subtle pt-3">
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={!!isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!formData.accountId || formData.amount <= 0 || isOverBalance || !!isLoading}
          form="addprogressform-form"
        >
          {isLoading ? 'Guardando...' : 'Confirmar Aporte'}
        </Button>
      </div>
    </FormLayout>
  );
}
