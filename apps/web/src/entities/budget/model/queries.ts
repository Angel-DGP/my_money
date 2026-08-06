import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BudgetsService } from '@shared/api/services/budgets';
import type { CreateBudgetDto, UpdateBudgetDto } from '../types/budget.types';
import { budgetKeys } from './keys';
import { budgetInvalidations } from './invalidations';
import { useSessionStore } from '@entities/session';

export function useBudgetsQuery(params?: { page?: number; limit?: number }) {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: budgetKeys.list(params || {}),
    queryFn: () => BudgetsService.getAll(params),
    enabled: !!token,
  });
}

export function useBudgetQuery(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => BudgetsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetDto) => BudgetsService.create(data),
    onSuccess: () => {
      budgetInvalidations.onCreate(queryClient);
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDto }) => BudgetsService.update(id, data),
    onSuccess: (_, variables) => {
      budgetInvalidations.onUpdate(queryClient, variables.id);
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BudgetsService.delete(id),
    onSuccess: () => {
      budgetInvalidations.onDelete(queryClient);
    },
  });
}
