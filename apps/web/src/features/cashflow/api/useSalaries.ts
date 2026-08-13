import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export interface SalaryEvent {
  id: string;
  amount: string;
  description: string | null;
  date: string;
  status: string;
  account_id: string | null;
  source_type: 'SALARY';
}

// ──────────────────────────────────────────────────────────
// API
// ──────────────────────────────────────────────────────────
const SalaryService = {
  list: async (): Promise<SalaryEvent[]> => {
    const { data } = await apiClient.get('/cashflow/salaries');
    return data;
  },
  update: async (id: string, payload: { amount?: number; description?: string }): Promise<SalaryEvent> => {
    const { data } = await apiClient.patch(`/cashflow/salaries/${id}`, payload);
    return data;
  },
  delete: async (ids: string | string[]): Promise<void> => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    await Promise.all(idArray.map((id) => apiClient.delete(`/cashflow/salaries/${id}`)));
  },
};

// ──────────────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────────────
export const useSalaries = () =>
  useQuery({
    queryKey: ['salaries'],
    queryFn: SalaryService.list,
  });

export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; amount?: number; description?: string }) =>
      SalaryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['projections'] });
    },
  });
};

export const useDeleteSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string | string[]) => SalaryService.delete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      queryClient.invalidateQueries({ queryKey: ['projections'] });
    },
  });
};

