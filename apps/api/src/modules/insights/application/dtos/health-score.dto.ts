export interface FinancialHealthScoreDto {
  score: number; // 0 to 100
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  metrics: {
    savings_rate: number;
    budget_adherence: number;
    goals_progress: number;
  };
}
