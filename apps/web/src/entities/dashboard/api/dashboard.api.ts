import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import { useSessionStore } from '@entities/session';

export interface CurrencyAmount {
  currency: string;
  amount: number;
}

export interface DashboardSummary {
  total_balance: CurrencyAmount[];
  reserved_funds: CurrencyAmount[];
  blocked_funds: CurrencyAmount[];
  third_party_funds: CurrencyAmount[];
  available_balance: CurrencyAmount[];
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expense: number;
  net: number;
  currency: string;
}

export interface MonthlyFlowResponse {
  current_month: MonthlyFlow[];
  previous_month: MonthlyFlow[];
}

export const useDashboardSummary = () => {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/summary');
      return response.data as unknown as DashboardSummary;
    },
    enabled: !!token,
  });
};

export const useMonthlyFlow = () => {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['dashboard', 'monthly-flow'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/monthly-flow');
      return response.data as unknown as MonthlyFlowResponse;
    },
    enabled: !!token,
  });
};
