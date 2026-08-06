import { Goal } from '../../domain/goal.entity';

export class GoalDto {
  id!: string;
  name!: string;
  target_amount!: {
    value: string;
    currency: string;
  };
  current_amount!: {
    value: string;
    currency: string;
  };
  remaining_amount!: {
    value: string;
    currency: string;
  };
  progress_percentage!: number;
  status!: string;
  target_date!: string | null;

  description!: string | null;
  priority!: number;
  color!: string | null;
  icon!: string | null;
  account_id!: string | null;

  days_remaining!: number | null;
  daily_required!: number | null;
  monthly_required!: number | null;

  static fromDomain(goal: Goal): GoalDto {
    const dto = new GoalDto();
    dto.id = goal.id;
    dto.name = goal.name;
    dto.target_amount = goal.targetAmount.toJSON();
    dto.current_amount = goal.currentAmount.toJSON();
    
    // Calcular el restante (si target > current)
    const remaining = goal.targetAmount.subtract(goal.currentAmount);
    dto.remaining_amount = remaining.isNegative() 
      ? { value: '0.0000', currency: goal.targetAmount.currency } 
      : remaining.toJSON();
      
    dto.progress_percentage = goal.progressPercentage();
    dto.status = goal.status;
    dto.target_date = goal.targetDate ? goal.targetDate.toISOString() : null;

    dto.description = goal.description;
    dto.priority = goal.priority;
    dto.color = goal.color;
    dto.icon = goal.icon;
    dto.account_id = goal.accountId;

    dto.days_remaining = goal.daysRemaining();
    dto.daily_required = goal.dailyRequired();
    dto.monthly_required = goal.monthlyRequired();
    return dto;
  }
}
