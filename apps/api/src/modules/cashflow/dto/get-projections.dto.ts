import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetProjectionsQueryDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
