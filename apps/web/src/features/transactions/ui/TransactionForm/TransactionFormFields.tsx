import { Input, Label, Select } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import { useCategoriesQuery, type Category } from '@entities/category';
import { useCards, useSubscriptions, useProductServices } from '../../../catalogs/api/useCatalogs';
import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react';
import type { TransactionFormFieldsProps } from './TransactionForm.types';

export function TransactionFormFields({ form, isEdit }: TransactionFormFieldsProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  
  const { data: accounts = [] } = useAccountsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: cards = [] } = useCards();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: products = [] } = useProductServices();

  const selectedType = watch('type');
  const filteredCategories = categories.filter((c: Category) => c.type === selectedType);

  return (
    <>
      {/* Selector de Tipo */}
      <div className="col-span-12 flex bg-surface-2 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => !isEdit && setValue('type', 'EXPENSE')}
          disabled={isEdit}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${selectedType === 'EXPENSE' ? 'bg-background shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'} ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <TrendingDown className="w-4 h-4" /> Gasto
        </button>
        <button
          type="button"
          onClick={() => !isEdit && setValue('type', 'INCOME')}
          disabled={isEdit}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${selectedType === 'INCOME' ? 'bg-background shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'} ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <TrendingUp className="w-4 h-4" /> Ingreso
        </button>
        <button
          type="button"
          onClick={() => !isEdit && setValue('type', 'TRANSFER')}
          disabled={isEdit} 
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${selectedType === 'TRANSFER' ? 'bg-background shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'} ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <ArrowLeftRight className="w-4 h-4" /> Transferencia
        </button>
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
          <Input 
            id="amount" 
            type="number" 
            step="0.01" 
            className="pl-8" 
            placeholder="0.00" 
            {...register('amount', { valueAsNumber: true })} 
          />
        </div>
        {errors.amount && <p className="text-error-500 text-xs">{errors.amount.message}</p>}
      </div>

      <div className="col-span-12 md:col-span-6 space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-error-500 text-xs">{errors.date.message}</p>}
      </div>

      <div className="col-span-12 space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" placeholder="Ej. Compra semanal" {...register('description')} />
        {errors.description && <p className="text-error-500 text-xs">{errors.description.message}</p>}
      </div>

      {selectedType !== 'TRANSFER' ? (
        <>
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="account_id">Cuenta</Label>
            <Select id="account_id" {...register('account_id')}>
              <option value="">Selecciona una cuenta</option>
              {accounts.map((acc: Account) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </Select>
            {errors.account_id && <p className="text-error-500 text-xs">{errors.account_id.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="category_id">Categoría (Opcional)</Label>
            <Select id="category_id" {...register('category_id')}>
              <option value="">Sin categoría</option>
              {filteredCategories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </div>
        </>
      ) : (
        <>
          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="from_account_id">Cuenta Origen</Label>
            <Select id="from_account_id" {...register('from_account_id')}>
              <option value="">Selecciona cuenta origen</option>
              {accounts.map((acc: Account) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </Select>
            {errors.from_account_id && <p className="text-error-500 text-xs">{errors.from_account_id.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-6 space-y-2">
            <Label htmlFor="to_account_id">Cuenta Destino</Label>
            <Select id="to_account_id" {...register('to_account_id')}>
              <option value="">Selecciona cuenta destino</option>
              {accounts.map((acc: Account) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </Select>
            {errors.to_account_id && <p className="text-error-500 text-xs">{errors.to_account_id.message}</p>}
          </div>
        </>
      )}

      {selectedType !== 'TRANSFER' && (
        <>
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="payment_method">Método de Pago (Opcional)</Label>
              <Select id="payment_method" {...register('payment_method')}>
                <option value="">Efectivo / Transferencia</option>
                <option value="CARD">Tarjeta</option>
                <option value="CASH">Efectivo Físico</option>
                <option value="APP">App Bancaria</option>
              </Select>
            </div>
            
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="card_id">Tarjeta Usada (Opcional)</Label>
              <Select id="card_id" {...register('card_id')}>
                <option value="">Ninguna</option>
                {cards.map((c: { id: string; name: string; last_four?: string }) => (
                  <option key={c.id} value={c.id}>{c.name} (*{c.last_four})</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="subscription_id">Suscripción Relacionada (Opcional)</Label>
              <Select id="subscription_id" {...register('subscription_id')}>
                <option value="">No es una suscripción</option>
                {subscriptions.map((s: { id: string; name: string; amount: string | number }) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.amount})</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="product_id">Comercio / Producto Frecuente (Opcional)</Label>
              <Select id="product_id" {...register('product_id')}>
                <option value="">No aplica</option>
                {products.map((p: { id: string; name: string }) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
        </>
      )}

      <div className="col-span-12 space-y-2">
        <Label htmlFor="note">Notas (Opcional)</Label>
        <Input id="note" placeholder="Añade algún comentario o detalle..." {...register('note')} />
      </div>
    </>
  );
}
