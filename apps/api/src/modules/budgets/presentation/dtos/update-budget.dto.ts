import { IsString, IsNumber, Min, Max, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBudgetDto {
  @IsString()
  @IsOptional()
  amount?: string;

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
