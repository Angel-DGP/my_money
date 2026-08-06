import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, IsDateString, IsOptional, IsBoolean } from 'class-validator';
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

  @IsString()
  @IsOptional()
  soft_limit?: string;

  @IsString()
  @IsOptional()
  hard_limit?: string;

  @IsBoolean()
  @IsOptional()
  carry_over?: boolean;

  @IsBoolean()
  @IsOptional()
  ignore_refunds?: boolean;

  @IsBoolean()
  @IsOptional()
  ignore_transfers?: boolean;

  @IsBoolean()
  @IsOptional()
  is_frozen?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
