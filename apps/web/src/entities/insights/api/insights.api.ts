import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import { useSessionStore } from '@entities/session';

export type InsightType = 'WARNING' | 'SUGGESTION' | 'SUCCESS' | 'INFO';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  action_label?: string;
  action_url?: string;
  created_at: string;
}

export interface FinancialHealthScore {
  score: number;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  metrics: {
    savings_rate: number;
    budget_adherence: number;
    goals_progress: number;
  };
}

export const useInsights = () => {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const response = await apiClient.get('/insights');
      return response.data as unknown as Insight[];
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
  });
};

export const useHealthScore = () => {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['insights', 'health-score'],
    queryFn: async () => {
      const response = await apiClient.get('/insights/health-score');
      return response.data as unknown as FinancialHealthScore;
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

