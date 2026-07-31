import React, { useState } from 'react';
import { Button, Input, Label, MoneyInput, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@mymoney/ui';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionType } from '../../../entities/transaction/types/transaction.types';
import type { Account } from '../../../entities/account/types/account.types';
import type { Category } from '../../../entities/category/types/category.types';

interface TransactionFormProps {
  initialData?: Transaction;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: CreateTransactionDto | UpdateTransactionDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransactionForm({ initialData, accounts, categories, onSubmit, onCancel, isLoading }: TransactionFormProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.value || '0.00');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(initialData?.account_id || accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || categories[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount) return;

    if (initialData) {
      onSubmit({
        description,
        amount,
        date,
        category_id: categoryId || undefined,
      });
    } else {
      onSubmit({
        account_id: accountId,
        category_id: categoryId || undefined,
        type,
        amount,
        date,
        description,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialData && (
        <div className="flex bg-bg-muted p-1 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'EXPENSE' ? 'bg-white shadow-sm text-text-base' : 'text-text-muted hover:text-text-base'}`}
            onClick={() => setType('EXPENSE')}
          >
            Gasto
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'INCOME' ? 'bg-white shadow-sm text-text-base' : 'text-text-muted hover:text-text-base'}`}
            onClick={() => setType('INCOME')}
          >
            Ingreso
          </button>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="amount">Monto</Label>
        <MoneyInput
          value={parseFloat(amount) || 0}
          onChange={(val) => setAmount(val.toString())}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Input 
          id="description" 
          placeholder="Ej: Supermercado" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
      </div>

      {!initialData && (
        <div className="space-y-1">
          <Label htmlFor="account_id">Cuenta</Label>
          <select 
            id="account_id"
            className="w-full h-10 px-3 py-2 bg-bg-base border border-border-base rounded-md text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-text-base transition-colors"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="category_id">Categoría</Label>
          <select 
            id="category_id"
            className="w-full h-10 px-3 py-2 bg-bg-base border border-border-base rounded-md text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-text-base transition-colors"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Ninguna</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="date">Fecha</Label>
          <Input 
            id="date" 
            type="date"
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-border-subtle mt-6">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!accountId || !amount || isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
}
