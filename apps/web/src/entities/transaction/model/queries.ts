import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionsService } from '../../../shared/api/services/transactions';
import type { 
  Transaction, 
  CreateTransactionDto, 
  UpdateTransactionDto,
  CreateTransferDto,
  PaginatedResponse 
} from '../types/transaction.types';
import { transactionKeys } from './keys';
import { transactionInvalidations } from './invalidations';

export function useTransactionsQuery(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => TransactionsService.getAll(params),
  });
}

export function useTransactionDetailQuery(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => TransactionsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TransactionsService.create,
    onMutate: async (newTransaction) => {
      // Cancelar peticiones salientes
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
      
      // Mantenemos una ref para restaurar si falla
      const previousQueries = queryClient.getQueriesData<PaginatedResponse<Transaction>>({ 
        queryKey: transactionKeys.lists() 
      });

      // Optimistic update en todas las listas de transacciones
      queryClient.setQueriesData<PaginatedResponse<Transaction>>(
        { queryKey: transactionKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          
          const optimisticTransaction: Transaction = {
            id: `temp-${Date.now()}`,
            account_id: newTransaction.account_id,
            category_id: newTransaction.category_id || null,
            type: newTransaction.type,
            amount: { value: newTransaction.amount, currency: 'USD' }, // asumiendo USD optimísticamente
            date: newTransaction.date,
            description: newTransaction.description || null,
            is_transfer: false,
          };

          return {
            ...oldData,
            data: [optimisticTransaction, ...oldData.data]
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, newTransaction, context) => {
      // Restaurar si falla
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      // Siempre invalidar para asegurar sincronización con el servidor
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
      
      const previousQueries = queryClient.getQueriesData<PaginatedResponse<Transaction>>({ 
        queryKey: transactionKeys.lists() 
      });

      queryClient.setQueriesData<PaginatedResponse<Transaction>>(
        { queryKey: transactionKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter(t => t.id !== id)
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, id, context) => {
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
