import { IsNumber, IsDateString, IsString, IsOptional, Min } from 'class-validator';

export class CreateSalaryDto {
  @IsNumber()
  amount!: number;

  @IsDateString()
  startDate!: string;

  @IsNumber()
  @Min(1)
  months!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  accountId!: string;
}
