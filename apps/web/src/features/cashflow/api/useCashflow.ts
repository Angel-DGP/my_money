import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CashflowService } from '../../../shared/api/services/cashflow';

export const useProjections = (startDate: string, endDate: string, accountId?: string) => {
  return useQuery({
    queryKey: ['projections', startDate, endDate, accountId],
    queryFn: () => CashflowService.getProjections(startDate, endDate, accountId),
    enabled: !!startDate && !!endDate,
  });
};

export const useRegisterSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CashflowService.registerSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections'] });
    },
  });
};

export const useUpdateCashflowEventStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' }) =>
      CashflowService.updateEventStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections'] });
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
    },
  });
};

export const usePayCashflowEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { accountId: string; date?: string } }) =>
      CashflowService.payEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
    },
  });
};

export const useUnpayCashflowEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CashflowService.unpayEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projections'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
    },
  });
};
