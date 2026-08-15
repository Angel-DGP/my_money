import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { transactionSchema } from '../TransactionForm.schema';
import type { TransactionFormData } from '../TransactionForm.types';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, CreateTransferDto } from '@entities/transaction';
import { useCreateTransaction, useCreateTransfer, useUpdateTransaction, useDeleteTransaction, useTransferPairQuery } from '@entities/transaction';
import { useEffect } from 'react';

import {
  splitDateAndTimeToEC,
  combineDateAndTimeToECISO,
} from '@shared/utils/date';

export function useTransactionForm(initialData?: Transaction) {
  const navigate = useNavigate();
  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const isEdit = !!initialData;
  const transferPairId = initialData?.transfer_pair_id;
  const { data: transferPair } = useTransferPairQuery(transferPairId);
  const { date: initialDate, time: initialTime } = splitDateAndTimeToEC(initialData?.date);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: (initialData?.type as 'INCOME' | 'EXPENSE' | 'TRANSFER') || 'EXPENSE',
      amount: initialData ? parseFloat(initialData.amount.value) : ('' as unknown as number),
      description: initialData?.description || '',
      note: !initialData?.is_third_party ? (initialData?.third_party_note || '') : '',
      date: initialDate,
      time: initialTime,
      category_id: initialData?.category_id || (initialData ? 'none' : ''),
      account_id: initialData?.account_id || '',
      from_account_id: '',
      to_account_id: '',
      payment_method: initialData?.payment_method || (initialData ? 'none' : ''),
      card_id: initialData?.card_id || (initialData ? 'none' : ''),
      subscription_id: initialData?.subscription_id || (initialData ? 'none' : ''),
      product_id: initialData?.product_id || (initialData ? 'none' : ''),
      
      // Third party details
      is_third_party: initialData?.is_third_party || false,
      third_party_owner: initialData?.third_party_owner || '',
      third_party_note: initialData?.is_third_party ? (initialData?.third_party_note || '') : '',

      // Installment details
      installment: initialData?.installment ? {
        total_installments: initialData.installment.total_installments,
        interest_rate: initialData.installment.interest_rate ?? undefined,
        grace_months: initialData.installment.grace_months ?? 0,
      } : undefined,
    } as TransactionFormData
  });

  // Effect to populate from/to account for transfers when pair data is loaded
  useEffect(() => {
    if (isEdit && transferPair && transferPair.length === 2 && initialData?.type === 'TRANSFER') {
      const fromTx = transferPair.find(t => parseFloat(t.amount.value) < 0);
      const toTx = transferPair.find(t => parseFloat(t.amount.value) > 0);
      
      if (fromTx && toTx) {
        form.setValue('from_account_id', fromTx.account_id);
        form.setValue('to_account_id', toTx.account_id);
        form.setValue('amount', Math.abs(parseFloat(initialData.amount.value)));
      }
    }
  }, [transferPair, initialData, isEdit, form]);

  const isPending = createTransaction.isPending || createTransfer.isPending || updateTransaction.isPending || deleteTransaction.isPending;

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const isoDate = combineDateAndTimeToECISO(data.date, data.time);

      if (isEdit) {
        await updateTransaction.mutateAsync({
          id: initialData!.id,
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
          } as UpdateTransactionDto
        });
      } else {
        if (data.type === 'TRANSFER') {
          await createTransfer.mutateAsync({
            amount: data.amount.toString(),
            description: data.description,
            date: isoDate,
            from_account_id: data.from_account_id!,
            to_account_id: data.to_account_id!,
          } as CreateTransferDto);
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
        }
      }
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to save transaction', error);
    }
  };
  const handleConfirmDelete = async () => {
    if (!initialData) return;
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
    handleConfirmDelete,
    navigate,
  };
}
