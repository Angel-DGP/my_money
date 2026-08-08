export interface BudgetDto {
  id: string;
  category_id: string;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  amount: { value: string; currency: string };
  executed_amount: { value: string; currency: string };
  remaining_amount: { value: string; currency: string };
  available_amount: { value: string; currency: string };
  execution_percentage: number;
  is_over_budget: boolean;
  alert_threshold: number;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  start_date: string;
  end_date: string;
  soft_limit?: { value: string; currency: string };
  hard_limit?: { value: string; currency: string };
  carry_over: boolean;
  ignore_refunds: boolean;
  ignore_transfers: boolean;
  is_frozen: boolean;
  notes?: string;
  daily_expected_velocity: { value: string; currency: string };
  daily_actual_velocity: { value: string; currency: string };
  projected_end_amount: { value: string; currency: string };
  status_indicator: 'ACCELERATED' | 'NORMAL' | 'SLOW';
}

export interface CreateBudgetDto {
  category_id: string;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  amount: string;
  currency: string;
  start_date: string;
  alert_threshold?: number;
  soft_limit?: string;
  hard_limit?: string;
  carry_over?: boolean;
  ignore_refunds?: boolean;
  ignore_transfers?: boolean;
  is_frozen?: boolean;
  notes?: string;
}

export interface UpdateBudgetDto {
  amount?: string;
  currency?: string;
  alert_threshold?: number;
  soft_limit?: string;
  hard_limit?: string;
  carry_over?: boolean;
  ignore_refunds?: boolean;
  ignore_transfers?: boolean;
  is_frozen?: boolean;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
