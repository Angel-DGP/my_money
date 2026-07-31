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
    };
  }
}
