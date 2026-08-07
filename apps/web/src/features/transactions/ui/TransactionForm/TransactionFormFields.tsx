import { Input, Label, Select, Icon } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import { useCategoriesQuery, type Category } from '@entities/category';
import { useCards, useSubscriptions, useProductServices } from '../../../catalogs/api/useCatalogs';
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
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10">
      
      {/* ─── SECCIÓN: TIPO DE MOVIMIENTO ─────────────────────────────────────── */}
      <div className="col-span-12 space-y-4">
        <div className="flex bg-surface-2 p-1.5 rounded-xl border border-border-subtle shadow-sm">
          <button
            type="button"
            onClick={() => !isEdit && setValue('type', 'EXPENSE')}
            disabled={isEdit}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${
              selectedType === 'EXPENSE' 
                ? 'bg-background shadow-sm text-error-600 dark:text-error-400' 
                : 'text-text-secondary hover:text-text-primary'
            } ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Icon name="trending-down" size="sm" /> Gasto
          </button>
          
          <button
            type="button"
            onClick={() => !isEdit && setValue('type', 'INCOME')}
            disabled={isEdit}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${
              selectedType === 'INCOME' 
                ? 'bg-background shadow-sm text-success-600 dark:text-success-400' 
                : 'text-text-secondary hover:text-text-primary'
            } ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Icon name="trending-up" size="sm" /> Ingreso
          </button>
          
          <button
            type="button"
            onClick={() => !isEdit && setValue('type', 'TRANSFER')}
            disabled={isEdit} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${
              selectedType === 'TRANSFER' 
                ? 'bg-background shadow-sm text-brand-600 dark:text-brand-400' 
                : 'text-text-secondary hover:text-text-primary'
            } ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Icon name="arrow-left-right" size="sm" /> Transferencia
          </button>
        </div>
      </div>

      {/* ─── SECCIÓN: DETALLES PRINCIPALES ───────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="info" size="sm" className="text-brand-500" />
            Detalles Principales
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Información básica sobre {selectedType === 'TRANSFER' ? 'esta transferencia' : 'este movimiento'}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="0.00"
              leftIcon="dollar-sign"
              {...register('amount', { valueAsNumber: true })} 
            />
            {errors.amount && <p className="text-error-500 text-xs">{errors.amount.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input 
              id="date" 
              type="date"
              leftIcon="calendar"
              {...register('date')} 
            />
            {errors.date && <p className="text-error-500 text-xs">{errors.date.message}</p>}
          </div>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input 
              id="description" 
              placeholder="Ej. Compra semanal" 
              {...register('description')} 
            />
            {errors.description && <p className="text-error-500 text-xs">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN: CLASIFICACIÓN / CUENTAS ────────────────────────────────── */}
      <div className="col-span-12 space-y-5">
        <div className="border-b border-border-subtle pb-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="wallet" size="sm" className="text-brand-500" />
            Clasificación y Cuentas
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Indica de dónde provienen y adónde van los fondos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {selectedType !== 'TRANSFER' ? (
            <>
              <div className="col-span-12 md:col-span-6 space-y-2">
                <Select id="account_id" label="Cuenta" required {...register('account_id')}>
                  <option value="" disabled>Selecciona una cuenta</option>
                  {accounts.map((acc: Account) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </Select>
                {errors.account_id && <p className="text-error-500 text-xs">{errors.account_id.message}</p>}
              </div>

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Select id="category_id" label="Categoría (Opcional)" {...register('category_id')}>
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
                <Select id="from_account_id" label="Cuenta Origen" required {...register('from_account_id')}>
                  <option value="" disabled>Selecciona cuenta origen</option>
                  {accounts.map((acc: Account) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </Select>
                {errors.from_account_id && <p className="text-error-500 text-xs">{errors.from_account_id.message}</p>}
              </div>

              <div className="col-span-12 md:col-span-6 space-y-2">
                <Select id="to_account_id" label="Cuenta Destino" required {...register('to_account_id')}>
                  <option value="" disabled>Selecciona cuenta destino</option>
                  {accounts.map((acc: Account) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </Select>
                {errors.to_account_id && <p className="text-error-500 text-xs">{errors.to_account_id.message}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── SECCIÓN: INFORMACIÓN ADICIONAL (OPCIONAL) ───────────────────────── */}
      {selectedType !== 'TRANSFER' && (
        <div className="col-span-12 space-y-5">
          <div className="border-b border-border-subtle pb-3">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icon name="tag" size="sm" className="text-brand-500" />
              Información Adicional (Opcional)
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Etiqueta o asocia este movimiento con catálogos y notas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-surface-2/40 p-5 rounded-xl border border-border-subtle">
            
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Select id="payment_method" label="Método de Pago" {...register('payment_method')}>
                <option value="">Efectivo / Transferencia</option>
                <option value="CARD">Tarjeta</option>
                <option value="CASH">Efectivo Físico</option>
                <option value="APP">App Bancaria</option>
              </Select>
            </div>
            
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Select id="card_id" label="Tarjeta Usada" {...register('card_id')}>
                <option value="">Ninguna</option>
                {cards.map((c: { id: string; name: string; last_four?: string }) => (
                  <option key={c.id} value={c.id}>{c.name} (*{c.last_four})</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-2">
              <Select id="subscription_id" label="Suscripción Relacionada" {...register('subscription_id')}>
                <option value="">No es una suscripción</option>
                {subscriptions.map((s: { id: string; name: string; amount: string | number }) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.amount})</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-2">
              <Select id="product_id" label="Comercio / Producto" {...register('product_id')}>
                <option value="">No aplica</option>
                {products.map((p: { id: string; name: string }) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 space-y-2 pt-2">
              <Label htmlFor="note">Notas Generales</Label>
              <Input 
                id="note" 
                placeholder="Añade algún comentario o detalle..." 
                {...register('note')} 
              />
            </div>
          </div>
        </div>
      )}

      {selectedType === 'TRANSFER' && (
        <div className="col-span-12 space-y-2">
          <Label htmlFor="note">Notas (Opcional)</Label>
          <Input 
            id="note" 
            placeholder="Motivo de la transferencia..." 
            {...register('note')} 
          />
        </div>
      )}

    </div>
  );
}
