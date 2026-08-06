import { Budget } from '../../domain/budget.entity';

export class BudgetDto {
  id!: string;
  category_id!: string;
  period!: string;
  amount!: { value: string; currency: string };
  executed_amount!: { value: string; currency: string };
  remaining_amount!: { value: string; currency: string };
  available_amount!: { value: string; currency: string };
  execution_percentage!: number;
  is_over_budget!: boolean;
  alert_threshold!: number;
  status!: string;
  start_date!: string;
  end_date!: string;
  
  // Nuevos campos Fase F
  soft_limit?: { value: string; currency: string };
  hard_limit?: { value: string; currency: string };
  carry_over!: boolean;
  ignore_refunds!: boolean;
  ignore_transfers!: boolean;
  is_frozen!: boolean;
  notes?: string;

  // Computados
  daily_expected_velocity!: { value: string; currency: string };
  daily_actual_velocity!: { value: string; currency: string };
  projected_end_amount!: { value: string; currency: string };
  status_indicator!: string;

  static fromDomain(budget: Budget): BudgetDto {
    const amount = budget.amount;
    const executedAmount = budget.executedAmount;
    const remainingAmount = budget.remainingAmount();
    const availableAmount = budget.availableAmount();

    return {
      id: budget.id,
      category_id: budget.categoryId,
      period: budget.period,
      amount: { value: amount.value.toString(), currency: amount.currency },
      executed_amount: { value: executedAmount.value.toString(), currency: executedAmount.currency },
      remaining_amount: { value: remainingAmount.value.toString(), currency: remainingAmount.currency },
      available_amount: { value: availableAmount.value.toString(), currency: availableAmount.currency },
      execution_percentage: budget.executionPercentage(),
      is_over_budget: budget.isOverBudget(),
      alert_threshold: budget.alertThreshold,
      status: budget.status,
      start_date: budget.startDate.toISOString().split('T')[0],
      end_date: budget.endDate.toISOString().split('T')[0],
      soft_limit: budget.softLimit ? { value: budget.softLimit.value.toString(), currency: budget.softLimit.currency } : undefined,
      hard_limit: budget.hardLimit ? { value: budget.hardLimit.value.toString(), currency: budget.hardLimit.currency } : undefined,
      carry_over: budget.carryOver,
      ignore_refunds: budget.ignoreRefunds,
      ignore_transfers: budget.ignoreTransfers,
      is_frozen: budget.isFrozen,
      notes: budget.notes,
      daily_expected_velocity: { value: budget.dailyExpectedVelocity.value.toString(), currency: budget.dailyExpectedVelocity.currency },
      daily_actual_velocity: { value: budget.dailyActualVelocity.value.toString(), currency: budget.dailyActualVelocity.currency },
      projected_end_amount: { value: budget.projectedEndAmount.value.toString(), currency: budget.projectedEndAmount.currency },
      status_indicator: budget.statusIndicator,
    };
  }
}
