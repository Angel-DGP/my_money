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
    return dto;
  }
}
