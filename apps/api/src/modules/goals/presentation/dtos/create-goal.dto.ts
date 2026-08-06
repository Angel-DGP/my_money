import { IsString, IsNotEmpty, IsNumber, IsOptional, IsISO8601, Min, Length, Max } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @IsNumber()
  @Min(0.01)
  target_amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsOptional()
  @IsISO8601()
  target_date?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  priority?: number;

  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  icon?: string;

  @IsOptional()
  @IsString()
  account_id?: string;
}
