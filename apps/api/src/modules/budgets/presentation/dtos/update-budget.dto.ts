import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UpdateBudgetDto {
  @IsString()
  @IsOptional()
  amount?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  alert_threshold?: number;
}
