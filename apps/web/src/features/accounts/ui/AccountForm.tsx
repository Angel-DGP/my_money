import React, { useState } from 'react';
import { Button, Input, Label, MoneyInput } from '@mymoney/ui';
import { Account, CreateAccountDto, UpdateAccountDto, AccountType, Currency } from '../../../entities/account/types/account.types';

interface AccountFormProps {
  initialData?: Account;
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AccountForm({ initialData, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<AccountType>(initialData?.type || 'BANK');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'USD');
  const [initialBalance, setInitialBalance] = useState(initialData?.current_balance.value || '0.00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      onSubmit({
        name,
        type,
        currency,
      });
    } else {
      onSubmit({
        name,
        type,
        currency,
        initial_balance: initialBalance,
        color: '#10B981',
        icon: 'wallet',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de la cuenta</Label>
        <Input 
          id="name" 
          placeholder="Ej: Ahorros Banreservas" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="type">Tipo</Label>
        <select 
          id="type"
          className="w-full h-10 px-3 py-2 bg-bg-base border border-border-base rounded-md text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-text-base transition-colors"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
        >
          <option value="BANK">Banco</option>
          <option value="CASH">Efectivo</option>
          <option value="CREDIT_CARD">Tarjeta de Crédito</option>
          <option value="INVESTMENT">Inversión</option>
        </select>
      </div>

      {!initialData && (
        <div className="space-y-1">
          <Label htmlFor="initial_balance">Balance Inicial</Label>
          <MoneyInput
            value={parseFloat(initialBalance) || 0}
            onChange={(val) => setInitialBalance(val.toString())}
          />
        </div>
      )}

      <div className="pt-4 flex justify-end gap-2 border-t border-border-subtle mt-6">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!name.trim() || isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
        </Button>
      </div>
    </form>
  );
}
