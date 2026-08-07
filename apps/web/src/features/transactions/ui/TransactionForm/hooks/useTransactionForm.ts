import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { transactionSchema } from '../TransactionForm.schema';
import type { TransactionFormData } from '../TransactionForm.types';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, CreateTransferDto } from '@entities/transaction';
import { useCreateTransaction, useCreateTransfer, useUpdateTransaction, useDeleteTransaction } from '@entities/transaction';

export function useTransactionForm(initialData?: Transaction) {
  const navigate = useNavigate();
  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

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

  const isPending = createTransaction.isPending || createTransfer.isPending || updateTransaction.isPending || deleteTransaction.isPending;

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (isEdit) {
        await updateTransaction.mutateAsync({
          id: initialData!.id,
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

  return {
    form,
    isEdit,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
    navigate,
  };
}
