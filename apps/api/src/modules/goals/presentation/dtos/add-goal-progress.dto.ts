import { IsNumber, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddGoalProgressDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsNotEmpty()
  accountId!: string;
}
