import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import { useSessionStore } from '../../session';

export interface SpendingByCategoryDto {
  category_id: string;
  category_name: string;
  category_icon: string | null;
  amount: number;
  currency: string;
  percentage: number;
}

export interface CashFlowDto {
  month: string;
  income: number;
  expense: number;
  currency: string;
}

export interface AnalyticsResponseDto {
  spending_by_category: SpendingByCategoryDto[];
  cash_flow: CashFlowDto[];
}

export const useAnalytics = () => {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics');
      return response.data as unknown as AnalyticsResponseDto;
    },
    enabled: !!token,
  });
};
