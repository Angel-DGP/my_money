/** Estados posibles de una meta — deben coincidir con GoalStatus del backend */
export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface GoalDto {
  id: string;
  name: string;
  target_amount: {
    value: string;
    currency: string;
  };
  current_amount: {
    value: string;
    currency: string;
  };
  remaining_amount: {
    value: string;
    currency: string;
  };
  progress_percentage: number;
  status: GoalStatus;
  target_date: string | null;
  description: string | null;
  priority: number;
  color: string | null;
  icon: string | null;
  account_id: string | null;
  days_remaining: number | null;
  daily_required: number | null;
  monthly_required: number | null;
}

export interface CreateGoalDto {
  name: string;
  target_amount: number;
  currency: string;
  target_date?: string;
  description?: string;
  priority?: number;
  color?: string;
  icon?: string;
  account_id?: string;
}

/**
 * DTO para actualizar una meta.
 * Todos los campos son opcionales. Se pueden anular campos optativos enviando `null`.
 */
export interface UpdateGoalDto {
  name?: string;
  target_amount?: number;
  currency?: string;
  target_date?: string | null;
  description?: string | null;
  priority?: number;
  color?: string | null;
  icon?: string | null;
  account_id?: string | null;
}

export interface AddGoalProgressDto {
  amount: number;
  currency: string;
  accountId: string;
}
