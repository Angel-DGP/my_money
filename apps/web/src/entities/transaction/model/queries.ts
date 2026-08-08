import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionsService } from '@shared/api/services/transactions';
import type { 
  Transaction, 
  UpdateTransactionDto,
} from '../types/transaction.types';
import { transactionKeys } from './keys';
import { transactionInvalidations } from './invalidations';
import { useSessionStore } from '@entities/session';

export function useTransactionsQuery(params?: { page?: number; limit?: number }) {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => TransactionsService.getAll(params),
    enabled: !!token,
  });
}

export function useTransactionDetailQuery(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => TransactionsService.getById(id),
    enabled: !!id,
  });
}

export function useTransferPairQuery(pairId?: string | null) {
  return useQuery({
    queryKey: ['transferPair', pairId],
    queryFn: () => TransactionsService.getTransferPair(pairId!),
    enabled: !!pairId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TransactionsService.create,
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      const previousQueries = queryClient.getQueriesData<Transaction[]>({ 
        queryKey: transactionKeys.lists() 
      });

      queryClient.setQueriesData<Transaction[]>(
        { queryKey: transactionKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          
          const optimisticTransaction: Transaction = {
            id: `temp-${Date.now()}`,
            account_id: newTransaction.account_id,
            category_id: newTransaction.category_id || null,
            type: newTransaction.type,
            amount: { value: newTransaction.amount, currency: 'USD' }, 
            date: newTransaction.date,
            description: newTransaction.description || null,
            is_third_party: newTransaction.is_third_party || false,
            third_party_owner: newTransaction.third_party_owner || null,
            third_party_note: newTransaction.third_party_note || null,
            payment_method: newTransaction.payment_method || null,
            card_id: newTransaction.card_id || null,
            subscription_id: newTransaction.subscription_id || null,
            product_id: newTransaction.product_id || null,
            transfer_pair_id: null,
          };

          return [optimisticTransaction, ...oldData];
        }
      );

      return { previousQueries };
    },
    onError: (_err, _newTransaction, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      transactionInvalidations.onCreate(queryClient);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) => TransactionsService.update(id, data),
    onSuccess: (_, variables) => {
      transactionInvalidations.onUpdate(queryClient, variables.id);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TransactionsService.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      
      const previousQueries = queryClient.getQueriesData<Transaction[]>({ 
        queryKey: transactionKeys.lists() 
      });

      queryClient.setQueriesData<Transaction[]>(
        { queryKey: transactionKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(t => t.id !== id);
        }
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      transactionInvalidations.onDelete(queryClient);
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TransactionsService.createTransfer,
    onSuccess: () => {
      transactionInvalidations.onCreate(queryClient);
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
