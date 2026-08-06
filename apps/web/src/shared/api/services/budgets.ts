import { apiClient } from '../client';
import type { CreateBudgetDto, UpdateBudgetDto, BudgetDto } from '@entities/budget';

export const BudgetsService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<BudgetDto[]> => {
    const { data } = await apiClient.get<BudgetDto[] >('/budgets', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<BudgetDto>(`/budgets/${id}`);
    return data;
  },

  create: async (payload: CreateBudgetDto) => {
    const { data } = await apiClient.post<BudgetDto>('/budgets', payload);
    return data;
  },

  update: async (id: string, payload: UpdateBudgetDto) => {
    const { data } = await apiClient.patch<BudgetDto>(`/budgets/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/budgets/${id}`);
  },
};
