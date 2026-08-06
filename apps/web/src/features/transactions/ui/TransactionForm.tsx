
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label, Select, FormLayout, PageContainer } from '@mymoney/ui';
import { useAccountsQuery, type Account } from '@entities/account';
import { useCategoriesQuery, type Category } from '@entities/category';
import { useCreateTransaction, useCreateTransfer, useUpdateTransaction, useDeleteTransaction } from '@entities/transaction';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, CreateTransferDto } from '@entities/transaction';
import { useCards, useSubscriptions, useProductServices } from '../../catalogs/api/useCatalogs';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(3, 'La descripción es requerida'),
  note: z.string().optional(),
  date: z.string(),
  // For Income/Expense
  account_id: z.string().optional(),
  category_id: z.string().optional(),
  // For Transfer
  from_account_id: z.string().optional(),
  to_account_id: z.string().optional(),
  
  // Catalogs
  payment_method: z.string().optional(),
  card_id: z.string().optional(),
  subscription_id: z.string().optional(),
  product_id: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'TRANSFER') {
    if (!data.from_account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['from_account_id'], message: 'Requerido para transferencias' });
    }
    if (!data.to_account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to_account_id'], message: 'Requerido para transferencias' });
    }
    if (data.from_account_id === data.to_account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to_account_id'], message: 'Las cuentas deben ser diferentes' });
    }
  } else {
    if (!data.account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['account_id'], message: 'Requerido' });
    }
  }
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Transaction;
}

export function TransactionForm({ initialData }: TransactionFormProps) {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccountsQuery();
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesQuery();
  
  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const { data: cards = [] } = useCards();
  const { data: subscriptions = [] } = useSubscriptions();
  const { data: products = [] } = useProductServices();

  const isEdit = !!initialData;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: (initialData?.type as 'INCOME' | 'EXPENSE' | 'TRANSFER') || 'EXPENSE',
      amount: initialData ? parseFloat(initialData.amount.value) : 0,
      description: initialData?.description || '',
      note: initialData?.third_party_note || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category_id: initialData?.category_id || '',
      account_id: initialData?.account_id || '',
      from_account_id: '',
      to_account_id: '',
      payment_method: initialData?.payment_method || '',
      card_id: initialData?.card_id || '',
      subscription_id: initialData?.subscription_id || '',
      product_id: initialData?.product_id || '',
    } as TransactionFormData
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const selectedType = watch('type');
  const isLoading = loadingAccounts || loadingCategories || createTransaction.isPending || createTransfer.isPending || updateTransaction.isPending || deleteTransaction.isPending;

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (isEdit) {
        await updateTransaction.mutateAsync({
          id: initialData.id,
          data: {
            amount: data.amount.toString(),
            description: data.description,
            date: data.date,
            ...(data.category_id ? { category_id: data.category_id } : {}),
            ...(data.note ? { third_party_note: data.note } : {}),
            ...(data.payment_method ? { payment_method: data.payment_method } : {}),
            ...(data.card_id ? { card_id: data.card_id } : {}),
            ...(data.subscription_id ? { subscription_id: data.subscription_id } : {}),
            ...(data.product_id ? { product_id: data.product_id } : {}),
          } as UpdateTransactionDto
        });
      } else {
        if (data.type === 'TRANSFER') {
          await createTransfer.mutateAsync({
            amount: data.amount.toString(),
            description: data.description,
            date: data.date,
            from_account_id: data.from_account_id!,
            to_account_id: data.to_account_id!,
          } as CreateTransferDto);
        } else {
          await createTransaction.mutateAsync({
            type: data.type as 'INCOME' | 'EXPENSE',
            amount: data.amount.toString(),
            description: data.description,
            date: data.date,
            account_id: data.account_id!,
            ...(data.category_id ? { category_id: data.category_id } : {}),
            ...(data.note ? { third_party_note: data.note } : {}),
            ...(data.payment_method ? { payment_method: data.payment_method } : {}),
            ...(data.card_id ? { card_id: data.card_id } : {}),
            ...(data.subscription_id ? { subscription_id: data.subscription_id } : {}),
            ...(data.product_id ? { product_id: data.product_id } : {}),
          } as CreateTransactionDto);
        }
      }
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to save transaction', error);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !window.confirm('¿Eliminar esta transacción?')) return;
    try {
      await deleteTransaction.mutateAsync(initialData.id);
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const filteredCategories = categories.filter((c: Category) => c.type === selectedType);

  return (
    <FormLayout onSubmit={handleSubmit(onSubmit)}>
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
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (*{c.last_four})</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="subscription_id">Suscripción Relacionada (Opcional)</Label>
              <Select id="subscription_id" {...register('subscription_id')}>
                <option value="">No es una suscripción</option>
                {subscriptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.amount})</option>
                ))}
              </Select>
            </div>

            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="product_id">Comercio / Producto Frecuente (Opcional)</Label>
              <Select id="product_id" {...register('product_id')}>
                <option value="">No aplica</option>
                {products.map(p => (
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

      <PageContainer.Footer className="col-span-12">
        {isEdit && (
          <Button variant="ghost" type="button" onClick={handleDelete} disabled={isLoading} className="text-error-600 hover:text-error-700 hover:bg-error-50">
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => navigate('/transactions')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createTransaction.isPending || updateTransaction.isPending || createTransfer.isPending}>
          {isEdit ? 'Actualizar' : 'Guardar'}
        </Button>
      </PageContainer.Footer>
    </FormLayout>
  );
}
