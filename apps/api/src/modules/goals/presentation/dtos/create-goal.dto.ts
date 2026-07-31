import { IsString, IsNotEmpty, IsNumber, IsOptional, IsISO8601, Min, Length } from 'class-validator';

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
}
