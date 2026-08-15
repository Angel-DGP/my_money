import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from './TransactionForm/TransactionForm.schema';
import type { TransactionFormData } from './TransactionForm/TransactionForm.types';
import {
  useCreateTransaction,
  useCreateTransfer,
  useUpdateTransaction,
  useDeleteTransaction,
  type Transaction,
  type CreateTransactionDto,
  type UpdateTransactionDto,
  type CreateTransferDto,
} from '@entities/transaction';
import { useAccountsQuery, AccountSelect } from '@entities/account';
import { useCategoriesQuery, useCreateCategory, type Category } from '@entities/category';
import { CategorySelect } from '../../categories';
import { useCards, useProductServices } from '../../catalogs/api/useCatalogs';
import type { CardDto } from '../../../shared/api/dto/catalogs.dto';
import {
  getEcuadorTodayString,
  getEcuadorCurrentTimeString,
  splitDateAndTimeToEC,
  combineDateAndTimeToECISO,
  formatLongDateTimeEC,
} from '@shared/utils/date';
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  MoneyInput,
  DatePicker,
  Switch,
  NumberInput,
  Icon,
  Badge,
  toast,
  Dialog,
  AlertDialog,
} from '@mymoney/ui';

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null | undefined;
  initialViewMode?: boolean | undefined;
  defaultAccountId?: string | undefined;
}

export function TransactionDrawer({
  open,
  onOpenChange,
  transaction,
  initialViewMode = false,
  defaultAccountId,
}: TransactionDrawerProps) {
  const isEdit = !!transaction;
  const [isView, setIsView] = useState(initialViewMode);
  const [showInstallments, setShowInstallments] = useState(false);
  const [showThirdParty, setShowThirdParty] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Inline Category creation modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('none');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: accounts } = useAccountsQuery();
  const { data: categories, refetch: refetchCategories } = useCategoriesQuery();
  const { data: cards = [] } = useCards();
  const { data: products = [] } = useProductServices();

  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const createCategory = useCreateCategory();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      amount: '' as unknown as number,
      description: '',
      note: '',
      date: getEcuadorTodayString(),
      time: getEcuadorCurrentTimeString(),
      category_id: 'none',
      account_id: '',
      from_account_id: '',
      to_account_id: '',
      payment_method: 'none',
      card_id: 'none',
      product_id: 'none',
      is_third_party: false,
      third_party_owner: '',
      third_party_note: '',
      installment: undefined,
    } as TransactionFormData,
  });

  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = form;
  const selectedType = watch('type');
  const amountValue = watch('amount');

  useEffect(() => {
    setIsView(initialViewMode);
  }, [initialViewMode, open]);

  useEffect(() => {
    if (transaction) {
      const hasInst = !!transaction.installment;
      const hasTP = !!transaction.is_third_party;
      setShowInstallments(hasInst);
      setShowThirdParty(hasTP);
      setShowAdvanced(!!(transaction.card_id || transaction.subscription_id || transaction.product_id || transaction.payment_method));

      const { date: txDate, time: txTime } = splitDateAndTimeToEC(transaction.date);

      reset({
        type: (transaction.type as 'EXPENSE' | 'INCOME' | 'TRANSFER') || 'EXPENSE',
        amount: parseFloat(transaction.amount?.value || '0'),
        description: transaction.description || '',
        note: !transaction.is_third_party ? (transaction.third_party_note || '') : '',
        date: txDate,
        time: txTime,
        category_id: transaction.category_id || 'none',
        account_id: transaction.account_id || '',
        from_account_id: '',
        to_account_id: '',
        payment_method: transaction.payment_method || 'none',
        card_id: transaction.card_id || 'none',
        subscription_id: transaction.subscription_id || 'none',
        product_id: transaction.product_id || 'none',
        is_third_party: hasTP,
        third_party_owner: transaction.third_party_owner || '',
        third_party_note: hasTP ? (transaction.third_party_note || '') : '',
        installment: hasInst && transaction.installment ? {
          total_installments: transaction.installment.total_installments,
          interest_rate: transaction.installment.interest_rate ?? undefined,
          grace_months: transaction.installment.grace_months ?? 0,
        } : undefined,
      } as TransactionFormData);
    } else {
      setShowInstallments(false);
      setShowThirdParty(false);
      setShowAdvanced(false);
      reset({
        type: 'EXPENSE',
        amount: '' as unknown as number,
        description: '',
        note: '',
        date: getEcuadorTodayString(),
        time: getEcuadorCurrentTimeString(),
        category_id: 'none',
        account_id: defaultAccountId || accounts?.[0]?.id || '',
        from_account_id: defaultAccountId || accounts?.[0]?.id || '',
        to_account_id: accounts?.[1]?.id || accounts?.[0]?.id || '',
        payment_method: 'none',
        card_id: 'none',
        product_id: 'none',
        is_third_party: false,
        third_party_owner: '',
        third_party_note: '',
        installment: undefined,
      } as TransactionFormData);
    }
  }, [transaction, reset, open, accounts, defaultAccountId]);

  const isPending = createTransaction.isPending || createTransfer.isPending || updateTransaction.isPending || deleteTransaction.isPending;

  const onSubmit = async (data: TransactionFormData) => {
    try {
      // Validar fondos si la cuenta origen no es crédito
      if (data.type === 'EXPENSE') {
        const acc = accounts?.find((a) => a.id === data.account_id);
        if (acc && acc.type !== 'CREDIT') {
          const avail = parseFloat(acc.current_balance?.value || '0');
          if (data.amount > avail) {
            toast({
              title: 'Saldo insuficiente',
              description: `La cuenta ${acc.name} solo dispone de $${avail.toFixed(2)} ${acc.currency}.`,
              variant: 'error',
            });
            return;
          }
        }
      } else if (data.type === 'TRANSFER') {
        const acc = accounts?.find((a) => a.id === data.from_account_id);
        if (acc && acc.type !== 'CREDIT') {
          const avail = parseFloat(acc.current_balance?.value || '0');
          if (data.amount > avail) {
            toast({
              title: 'Saldo insuficiente',
              description: `La cuenta de origen ${acc.name} solo dispone de $${avail.toFixed(2)} ${acc.currency}.`,
              variant: 'error',
            });
            return;
          }
        }
      }

      const isoDate = combineDateAndTimeToECISO(data.date, data.time);

      if (isEdit && transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          data: {
            amount: data.amount.toString(),
            description: data.description,
            date: isoDate,
            category_id: data.category_id === 'none' ? null : (data.category_id || null),
            is_third_party: data.is_third_party || false,
            third_party_owner: data.is_third_party ? (data.third_party_owner || null) : null,
            third_party_note: data.is_third_party ? (data.third_party_note || null) : (data.note || null),
            payment_method: data.payment_method === 'none' ? null : (data.payment_method || null),
            card_id: data.card_id === 'none' ? null : (data.card_id || null),
            subscription_id: data.subscription_id === 'none' ? null : (data.subscription_id || null),
            product_id: data.product_id === 'none' ? null : (data.product_id || null),
          } as UpdateTransactionDto,
        });
        toast({ title: 'Transacción actualizada', description: 'Los cambios se han guardado exitosamente.', variant: 'success' });
      } else {
        if (data.type === 'TRANSFER') {
          await createTransfer.mutateAsync({
            amount: data.amount.toString(),
            description: data.description,
            date: isoDate,
            from_account_id: data.from_account_id!,
            to_account_id: data.to_account_id!,
          } as CreateTransferDto);
          toast({ title: 'Transferencia realizada', description: 'Fondos transferidos entre cuentas.', variant: 'success' });
        } else {
          await createTransaction.mutateAsync({
            type: data.type as 'INCOME' | 'EXPENSE',
            amount: data.amount.toString(),
            description: data.description,
            date: isoDate,
            account_id: data.account_id!,
            ...(data.category_id && data.category_id !== 'none' ? { category_id: data.category_id } : {}),
            is_third_party: data.is_third_party || false,
            ...(data.is_third_party ? {
              third_party_owner: data.third_party_owner || null,
              third_party_note: data.third_party_note || null,
            } : {
              third_party_note: data.note || null,
            }),
            ...(data.payment_method && data.payment_method !== 'none' ? { payment_method: data.payment_method } : {}),
            ...(data.card_id && data.card_id !== 'none' ? { card_id: data.card_id } : {}),
            ...(data.subscription_id && data.subscription_id !== 'none' ? { subscription_id: data.subscription_id } : {}),
            ...(data.product_id && data.product_id !== 'none' ? { product_id: data.product_id } : {}),
            ...(data.installment && data.installment.total_installments ? { installment: data.installment } : {}),
          } as CreateTransactionDto);
          toast({ title: 'Transacción guardada', description: 'El movimiento ha sido registrado.', variant: 'success' });
        }
      }
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error saving transaction', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error al registrar',
        description: err.response?.data?.message || 'No se pudo guardar la transacción.',
        variant: 'error',
      });
    }
  };

  const currentAccountId = watch('account_id');
  const selectedAccount = useMemo(() => accounts?.find((a) => a.id === currentAccountId) || null, [accounts, currentAccountId]);
  const isCashAccount = selectedAccount?.type === 'CASH';

  const currentCardId = watch('card_id');
  const selectedCard = useMemo(() => cards.find((c) => c.id === currentCardId) || null, [cards, currentCardId]);

  // Only Credit accounts or selecting a Credit Card allows installment deferrals
  const isCreditInstrument = selectedAccount?.type === 'CREDIT' || selectedCard?.type === 'CREDIT';
  const canDeferInstallments = selectedType === 'EXPENSE' && isCreditInstrument;

  useEffect(() => {
    if (!canDeferInstallments && showInstallments) {
      setShowInstallments(false);
      setValue('installment', undefined);
    }
  }, [canDeferInstallments, showInstallments, setValue]);

  const availableCards = useMemo(() => {
    if (!cards || cards.length === 0 || isCashAccount) return [];
    if (selectedAccount?.institution_id) {
      const matching = cards.filter((c) => c.institution_id === selectedAccount.institution_id);
      if (matching.length > 0) return matching;
    }
    return cards;
  }, [cards, selectedAccount, isCashAccount]);

  const handleAccountSelectChange = (accId: string) => {
    setValue('account_id', accId, { shouldValidate: true });
    const acc = accounts?.find((a) => a.id === accId);
    if (acc?.type === 'CASH') {
      setValue('payment_method', 'CASH');
      setValue('card_id', 'none');
      setShowInstallments(false);
    } else if (acc?.type === 'CREDIT') {
      setValue('payment_method', 'CARD');
      const matchingCard = cards.find((c) => c.institution_id === acc.institution_id);
      if (matchingCard) {
        setValue('card_id', matchingCard.id);
      }
    } else {
      if (watch('payment_method') === 'CASH') {
        setValue('payment_method', 'TRANSFER');
      }
    }
  };

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await createCategory.mutateAsync({
        name: newCatName.trim(),
        type: selectedType === 'INCOME' ? 'INCOME' : 'EXPENSE',
        icon: 'tag',
        color: '#3b82f6',
        parent_id: newCatParentId && newCatParentId !== 'none' ? newCatParentId : undefined,
      });
      await refetchCategories();
      setValue('category_id', res.id, { shouldValidate: true });
      setNewCatName('');
      setNewCatParentId('none');
      setCategoryModalOpen(false);
      toast({ title: 'Categoría creada', description: 'Categoría asignada a la transacción.', variant: 'success' });
    } catch (err) {
      console.error('Error creating category', err);
      toast({ title: 'Error', description: 'No se pudo crear la categoría.', variant: 'error' });
    }
  };

  const handleProductChange = (prodId: string) => {
    setValue('product_id', prodId);
    if (prodId && prodId !== 'none') {
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        if (prod.category_id) {
          setValue('category_id', prod.category_id);
        }
        const currentDesc = watch('description');
        if (!currentDesc || currentDesc.trim() === '') {
          setValue('description', prod.name);
        }
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!transaction) return;
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      toast({ title: 'Transacción eliminada', description: 'El movimiento ha sido eliminado.', variant: 'success' });
    } catch (error) {
      console.error('Error deleting transaction', error);
      toast({ title: 'Error al eliminar', description: 'No se pudo eliminar la transacción.', variant: 'error' });
    }
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Content size="xl">
          <Drawer.Header>
            <Drawer.Title>
              {isView
                ? 'Detalle de Transacción'
                : isEdit
                ? 'Editar Transacción'
                : selectedType === 'EXPENSE'
                ? 'Registrar Gasto'
                : selectedType === 'INCOME'
                ? 'Registrar Ingreso'
                : 'Nueva Transferencia'}
            </Drawer.Title>
            <Drawer.Description>
              {isView
                ? 'Comprobante y detalles del movimiento.'
                : 'Ingresa el monto y clasifica este movimiento financiero.'}
            </Drawer.Description>
          </Drawer.Header>

          {isView && transaction ? (
            /* ─── MODO RECIBO / LECTURA ───────────────────────────────────────── */
            <div className="flex flex-col flex-1 overflow-hidden">
              <Drawer.Body className="space-y-6">
                {/* Header del recibo con Icono Temático y Monto Limpio */}
                <div className="p-6 rounded-2xl bg-surface-2/40 border border-border-subtle text-center flex flex-col items-center space-y-3">
                  {/* Icono temático según tipo */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                    transaction.type === 'INCOME'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : transaction.type === 'EXPENSE'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    <Icon
                      name={
                        transaction.type === 'INCOME'
                          ? 'trending-up'
                          : transaction.type === 'EXPENSE'
                          ? 'trending-down'
                          : 'arrow-left-right'
                      }
                      size="md"
                    />
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    transaction.type === 'INCOME'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : transaction.type === 'EXPENSE'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {transaction.type === 'INCOME' ? 'Ingreso' : transaction.type === 'EXPENSE' ? 'Gasto' : 'Transferencia'}
                  </span>

                  <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    transaction.type === 'INCOME'
                      ? 'text-emerald-500'
                      : transaction.type === 'EXPENSE'
                      ? 'text-rose-500'
                      : 'text-text-primary'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: transaction.amount?.currency || 'USD',
                      maximumFractionDigits: 2,
                    }).format(parseFloat(transaction.amount?.value || '0'))}
                  </div>

                  <p className="text-sm font-semibold text-text-primary mt-1 max-w-sm">
                    {transaction.description || 'Sin descripción'}
                  </p>

                  <p className="text-xs text-text-muted">
                    {formatLongDateTimeEC(transaction.date)}
                  </p>
                </div>

                {/* Ficha técnica de detalles */}
                <div className="rounded-2xl border border-border-subtle divide-y divide-border-subtle bg-surface">
                  <div className="flex items-center justify-between p-3.5 text-sm">
                    <span className="text-text-secondary flex items-center gap-2">
                      <Icon name="wallet" size="sm" className="text-text-muted" /> Cuenta
                    </span>
                    <span className="font-semibold text-text-primary">
                      {transaction.account?.name || accounts?.find(a => a.id === transaction.account_id)?.name || 'Cuenta'}
                    </span>
                  </div>

                  {transaction.category_id && (
                    <div className="flex items-center justify-between p-3.5 text-sm">
                      <span className="text-text-secondary flex items-center gap-2">
                        <Icon name="tag" size="sm" className="text-text-muted" /> Categoría
                      </span>
                      <Badge variant="neutral">
                        {transaction.category?.name || categories?.find((c: Category) => c.id === transaction.category_id)?.name || 'Categoría'}
                      </Badge>
                    </div>
                  )}

                  {transaction.payment_method && (
                    <div className="flex items-center justify-between p-3.5 text-sm">
                      <span className="text-text-secondary flex items-center gap-2">
                        <Icon name="credit-card" size="sm" className="text-text-muted" /> Método de Pago
                      </span>
                      <span className="font-medium text-text-primary capitalize">{transaction.payment_method.toLowerCase()}</span>
                    </div>
                  )}

                  {transaction.installment && (
                    <div className="p-3.5 space-y-1 bg-surface-2/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary font-medium flex items-center gap-2">
                          <Icon name="repeat" size="sm" className="text-primary-500" /> Plan Diferido
                        </span>
                        <Badge variant="primary" size="sm">
                          {transaction.installment.total_installments} Cuotas
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted">
                        Tasa: {transaction.installment.interest_rate ? `${transaction.installment.interest_rate}%` : '0%'} | Meses de gracia: {transaction.installment.grace_months || 0}
                      </p>
                    </div>
                  )}

                  {transaction.is_third_party && (
                    <div className="p-3.5 space-y-1 bg-surface-2/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary font-medium flex items-center gap-2">
                          <Icon name="user" size="sm" className="text-primary-500" /> A nombre de tercero
                        </span>
                        <span className="font-semibold text-text-primary">{transaction.third_party_owner || 'Tercero'}</span>
                      </div>
                      {transaction.third_party_note && (
                        <p className="text-xs text-text-muted">Nota: {transaction.third_party_note}</p>
                      )}
                    </div>
                  )}
                </div>
              </Drawer.Body>

              <Drawer.Footer>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="text-error-500 hover:text-error-600 hover:border-error-500 mr-auto"
                >
                  <Icon name="trash" size="sm" className="mr-1.5" /> Eliminar
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
                <Button type="button" onClick={() => setIsView(false)}>
                  <Icon name="edit" size="sm" className="mr-1.5" /> Editar
                </Button>
              </Drawer.Footer>
            </div>
          ) : (
            /* ─── MODO FORMULARIO (Crear / Editar) ────────────────────────────── */
            <form id="transaction-drawer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <Drawer.Body className="space-y-6">
                {/* 1. Selector de Tipo (Gasto / Ingreso / Transferencia) */}
                {!isEdit && (
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-surface-2/50 rounded-2xl border border-border-subtle">
                    {[
                      { type: 'EXPENSE' as const, label: 'Gasto', color: 'text-error-600 bg-error-50 dark:bg-error-950/40 border-error-500/30' },
                      { type: 'INCOME' as const, label: 'Ingreso', color: 'text-success-600 bg-success-50 dark:bg-success-950/40 border-success-500/30' },
                      { type: 'TRANSFER' as const, label: 'Transferencia', color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/40 border-primary-500/30' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setValue('type', item.type, { shouldValidate: true })}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                          selectedType === item.type
                            ? `${item.color} shadow-sm scale-[1.02]`
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Campo de Monto Gigante */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-surface-2/30 border border-border-subtle text-center">
                  <Label htmlFor="drawer-tx-amount" required className="text-xs uppercase tracking-wider text-text-muted">
                    Monto de la Transacción
                  </Label>
                  <div className="max-w-xs mx-auto">
                    <MoneyInput
                      id="drawer-tx-amount"
                      name="amount"
                      value={parseFloat(amountValue ? amountValue.toString() : '0') || 0}
                      onValueChange={(val) => setValue('amount', val || ('' as unknown as number), { shouldValidate: true })}
                      disabled={isPending}
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-error-500 font-medium">{errors.amount.message}</p>}
                </div>

                {/* 3. Campos según Tipo */}
                {selectedType === 'TRANSFER' ? (
                  /* ─── TRANSFERENCIA ─────────────────────────────────────────── */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AccountSelect
                      id="drawer-from-acc"
                      label="Cuenta Origen"
                      required
                      disabled={isPending}
                      error={errors.from_account_id?.message as string}
                      value={watch('from_account_id') || ''}
                      onChange={(val) => setValue('from_account_id', val, { shouldValidate: true })}
                      excludeId={watch('to_account_id')}
                    />

                    <AccountSelect
                      id="drawer-to-acc"
                      label="Cuenta Destino"
                      required
                      disabled={isPending}
                      error={errors.to_account_id?.message as string}
                      value={watch('to_account_id') || ''}
                      onChange={(val) => setValue('to_account_id', val, { shouldValidate: true })}
                      excludeId={watch('from_account_id')}
                    />
                  </div>
                ) : (
                  /* ─── GASTO O INGRESO ───────────────────────────────────────── */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <AccountSelect
                        id="drawer-account-id"
                        label={selectedType === 'INCOME' ? 'Cuenta Destino' : 'Cuenta de Origen'}
                        required
                        disabled={isPending}
                        error={errors.account_id?.message as string}
                        value={watch('account_id') || ''}
                        onChange={(val) => handleAccountSelectChange(val)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-5 flex items-center justify-between">
                        <Label htmlFor="drawer-category-id">Categoría</Label>
                        <button
                          type="button"
                          onClick={() => setCategoryModalOpen(true)}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Icon name="plus" size="xs" /> Nueva
                        </button>
                      </div>
                      <CategorySelect
                        id="drawer-category-id"
                        value={watch('category_id') || 'none'}
                        onChange={(val) => setValue('category_id', val || 'none', { shouldValidate: true })}
                        filterType={selectedType === 'EXPENSE' ? 'EXPENSE' : 'INCOME'}
                        allowNone={true}
                        noneLabel="Sin Categoría"
                        disabled={isPending}
                        error={errors.category_id?.message as string}
                      />
                    </div>
                  </div>
                )}

                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="h-5 flex items-center">
                      <Label htmlFor="drawer-tx-date" required>Fecha</Label>
                    </div>
                    <DatePicker
                      id="drawer-tx-date"
                      value={watch('date')}
                      onChange={(d) => setValue('date', d, { shouldValidate: true })}
                      disabled={isPending}
                      error={errors.date?.message as string}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-5 flex items-center">
                      <Label htmlFor="drawer-tx-time" required>Hora</Label>
                    </div>
                    <Input
                      id="drawer-tx-time"
                      type="time"
                      disabled={isPending}
                      error={errors.time?.message as string}
                      required
                      {...register('time')}
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <div className="h-5 flex items-center">
                    <Label htmlFor="drawer-tx-desc" required>Descripción</Label>
                  </div>
                  <Input
                    id="drawer-tx-desc"
                    placeholder="Ej: Supermercado, Salario quincena..."
                    disabled={isPending}
                    error={errors.description?.message as string}
                    required
                    {...register('description')}
                  />
                </div>

                {/* 4. Opciones Avanzadas / Diferidos / Terceros */}
                {selectedType !== 'TRANSFER' && (
                  <div className="space-y-4 pt-2 border-t border-border-subtle">
                    {/* Switch Terceros */}
                    <div className="p-3.5 rounded-xl bg-surface-2/30 border border-border-subtle">
                      <Switch
                        id="drawer-tx-third-party"
                        label="¿Es a nombre de un tercero?"
                        description="Si pagaste por alguien o recibiste dinero para otro."
                        checked={showThirdParty}
                        onChange={(checked) => {
                          setShowThirdParty(checked);
                          setValue('is_third_party', checked);
                        }}
                        disabled={isPending}
                      />
                    </div>

                    {showThirdParty && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-2/20 border border-border-subtle animate-in fade-in duration-200">
                        <div className="space-y-2">
                          <Label htmlFor="drawer-tp-owner" required>Nombre del Tercero</Label>
                          <Input
                            id="drawer-tp-owner"
                            placeholder="Ej: Juan Pérez"
                            disabled={isPending}
                            {...register('third_party_owner')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="drawer-tp-note">Nota de Tercero</Label>
                          <Input
                            id="drawer-tp-note"
                            placeholder="Ej: Pendiente de reembolso"
                            disabled={isPending}
                            {...register('third_party_note')}
                          />
                        </div>
                      </div>
                    )}

                    {/* Switch Cuotas / Diferidos (solo Gasto y solo para instrumentos de Crédito) */}
                    {canDeferInstallments && (
                      <>
                        <div className="p-3.5 rounded-xl bg-surface-2/30 border border-border-subtle animate-in fade-in duration-200">
                          <Switch
                            id="drawer-tx-installments"
                            label="¿Pago a cuotas (Diferido)?"
                            description="Proyecta los pagos automáticamente en el flujo de caja."
                            checked={showInstallments}
                            onChange={(checked) => setShowInstallments(checked)}
                            disabled={isPending}
                          />
                        </div>

                        {showInstallments && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-2/20 border border-border-subtle animate-in fade-in duration-200">
                            <div className="space-y-2">
                              <NumberInput
                                id="drawer-inst-total"
                                label="Nº de Cuotas"
                                min={2}
                                max={48}
                                placeholder="Ej: 3, 6, 12"
                                suffix="cuotas"
                                disabled={isPending}
                                value={watch('installment.total_installments')}
                                onChange={(val) => setValue('installment.total_installments', val || 2)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <NumberInput
                                id="drawer-inst-rate"
                                label="Tasa Interés (%)"
                                step={0.01}
                                min={0}
                                max={100}
                                placeholder="0.00"
                                suffix="%"
                                disabled={isPending}
                                value={watch('installment.interest_rate') ?? undefined}
                                onChange={(val) => setValue('installment.interest_rate', val)}
                              />
                            </div>
                            <div className="space-y-2">
                              <NumberInput
                                id="drawer-inst-grace"
                                label="Meses Gracia"
                                min={0}
                                max={24}
                                placeholder="0"
                                suffix="meses"
                                disabled={isPending}
                                value={watch('installment.grace_months') ?? undefined}
                                onChange={(val) => setValue('installment.grace_months', val)}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Catálogos y Opciones Opcionales */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5"
                      >
                        <Icon name={showAdvanced ? 'chevron-up' : 'chevron-down'} size="xs" />
                        {showAdvanced ? 'Ocultar Opciones Avanzadas' : 'Más Opciones (Tarjeta, Suscripción, Producto)'}
                      </button>

                      {showAdvanced && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 rounded-xl bg-surface-2/20 border border-border-subtle animate-in fade-in duration-200">
                          <div className="space-y-2">
                            <Label htmlFor="drawer-payment-method">Método de Pago</Label>
                            {isCashAccount ? (
                              <Select id="drawer-payment-method" disabled value="CASH">
                                <option value="CASH">Efectivo</option>
                              </Select>
                            ) : (
                              <Select
                                id="drawer-payment-method"
                                disabled={isPending}
                                value={watch('payment_method') || 'none'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setValue('payment_method', val);
                                  if (val !== 'CARD') {
                                    setValue('card_id', 'none');
                                  }
                                }}
                              >
                                <option value="none">Ninguno</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="CARD">Tarjeta</option>
                                <option value="APP">Billetera / App</option>
                                <option value="CASH">Efectivo</option>
                              </Select>
                            )}
                          </div>

                          {selectedType === 'EXPENSE' && (
                            <>
                              {!isCashAccount && availableCards.length > 0 && (
                                <div className="space-y-2">
                                  <Label htmlFor="drawer-card-id">Tarjeta Usada</Label>
                                  <Select
                                    id="drawer-card-id"
                                    disabled={isPending}
                                    value={watch('card_id') || 'none'}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setValue('card_id', val);
                                      if (val && val !== 'none') {
                                        setValue('payment_method', 'CARD');
                                      }
                                    }}
                                  >
                                    <option value="none">Ninguna</option>
                                    {availableCards.map((c: CardDto) => (
                                      <option key={c.id} value={c.id}>{c.name} (*{c.last_four})</option>
                                    ))}
                                  </Select>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="drawer-prod-id">Producto / Comercio (Compra Frecuente)</Label>
                                <Select
                                  id="drawer-prod-id"
                                  disabled={isPending}
                                  value={watch('product_id') || 'none'}
                                  onChange={(e) => handleProductChange(e.target.value)}
                                >
                                  <option value="none">Ninguno</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Drawer.Body>

              <Drawer.Footer>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} form="transaction-drawer-form">
                  {isPending ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Registrar Movimiento'}
                </Button>
              </Drawer.Footer>
            </form>
          )}
        </Drawer.Content>
      </Drawer.Root>

      {/* Modal Liviano para Crear Categoría Inline */}
      <Dialog.Root open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <Dialog.Portal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={() => setCategoryModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md bg-surface rounded-2xl border border-border-subtle p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-bold text-text-primary">
                  Nueva Categoría
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded-md"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>

              <form onSubmit={handleQuickCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-cat-name" required>Nombre de la Categoría</Label>
                  <Input
                    id="quick-cat-name"
                    placeholder="Ej: Cafetería, Suscripciones..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-cat-parent">Categoría Padre (Opcional)</Label>
                  <Select
                    id="quick-cat-parent"
                    value={newCatParentId}
                    onChange={(e) => setNewCatParentId(e.target.value)}
                  >
                    <option value="none">Ninguna (Categoría Principal)</option>
                    {categories
                      ?.filter((c: Category) => c.type === (selectedType === 'INCOME' ? 'INCOME' : 'EXPENSE') && !c.parent_id)
                      .map((c: Category) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Badge variant={selectedType === 'INCOME' ? 'primary' : 'neutral'} size="md">
                    {selectedType === 'INCOME' ? 'Ingreso' : 'Gasto'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border-subtle">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCategoryModalOpen(false)}
                    disabled={createCategory.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createCategory.isPending || !newCatName.trim()}
                    loading={createCategory.isPending}
                  >
                    Crear y Asignar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Confirmación de Eliminación */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar Transacción"
        description={`¿Estás seguro de que deseas eliminar este movimiento por $${transaction?.amount?.value || ''}? Esta acción no se puede deshacer.`}
        type="error"
        confirmText="Sí, eliminar"
        isLoading={deleteTransaction.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
