import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import { useSessionStore } from '../../session';

export interface AnalyticsSummaryDto {
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
  avg_daily_expense: number;
  currency: string;
  previous_period_income: number;
  previous_period_expense: number;
  income_trend_percentage: number;
  expense_trend_percentage: number;
  transaction_count: number;
}

export interface SpendingByCategoryDto {
  category_id: string;
  category_name: string;
  category_icon: string | null;
  category_color: string | null;
  amount: number;
  transaction_count: number;
  currency: string;
  percentage: number;
}

export interface CashFlowDto {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  currency: string;
}

export interface TopExpenseDto {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category_name: string;
  category_icon: string | null;
  category_color: string | null;
}

export interface FinancialInsightDto {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'NEUTRAL';
  title: string;
  message: string;
  badge?: string;
}

export interface AnalyticsResponseDto {
  summary: AnalyticsSummaryDto;
  spending_by_category: SpendingByCategoryDto[];
  cash_flow: CashFlowDto[];
  top_expenses: TopExpenseDto[];
  insights: FinancialInsightDto[];
  period_months: number;
}

export const useAnalytics = (months: number = 1) => {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['analytics', months],
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsResponseDto>('/analytics', {
        params: { months },
      });
      return response.data;
    },
    enabled: !!token,
  });
};
