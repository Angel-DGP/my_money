export class AnalyticsSummaryDto {
  total_income!: number;
  total_expense!: number;
  net_savings!: number;
  savings_rate!: number; // Percentage, e.g. 24.5
  avg_daily_expense!: number;
  currency!: string;
  previous_period_income!: number;
  previous_period_expense!: number;
  income_trend_percentage!: number;
  expense_trend_percentage!: number;
  transaction_count!: number;
}

export class SpendingByCategoryDto {
  category_id!: string;
  category_name!: string;
  category_icon!: string | null;
  category_color!: string | null;
  amount!: number;
  transaction_count!: number;
  currency!: string;
  percentage!: number;
}

export class CashFlowDto {
  month!: string; // Format: YYYY-MM
  label!: string; // Format: "Ene 2026"
  income!: number;
  expense!: number;
  net!: number;
  currency!: string;
}

export class TopExpenseDto {
  id!: string;
  description!: string;
  amount!: number;
  currency!: string;
  date!: string;
  category_name!: string;
  category_icon!: string | null;
  category_color!: string | null;
}

export class FinancialInsightDto {
  id!: string;
  type!: 'SUCCESS' | 'WARNING' | 'INFO' | 'NEUTRAL';
  title!: string;
  message!: string;
  badge?: string;
}

export class AnalyticsResponseDto {
  summary!: AnalyticsSummaryDto;
  spending_by_category!: SpendingByCategoryDto[];
  cash_flow!: CashFlowDto[];
  top_expenses!: TopExpenseDto[];
  insights!: FinancialInsightDto[];
  period_months!: number;
}
