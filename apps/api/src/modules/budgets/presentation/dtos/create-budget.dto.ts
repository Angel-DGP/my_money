import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, IsDateString, IsOptional } from 'class-validator';
import { BudgetPeriod } from '../../domain/budget.entity';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  category_id!: string;

  @IsEnum(BudgetPeriod)
  @IsNotEmpty()
  period!: BudgetPeriod;

  @IsString()
  @IsNotEmpty()
  amount!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsDateString()
  @IsNotEmpty()
  start_date!: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  alert_threshold?: number;
}
