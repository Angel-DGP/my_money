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
