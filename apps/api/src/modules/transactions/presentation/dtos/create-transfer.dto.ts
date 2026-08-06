import { IsString, IsNotEmpty, IsNumberString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'ID of the source account' })
  @IsString()
  @IsNotEmpty()
  from_account_id!: string;

  @ApiProperty({ description: 'ID of the destination account' })
  @IsString()
  @IsNotEmpty()
  to_account_id!: string;

  @ApiProperty({ description: 'Amount to transfer', example: '100.50' })
  @IsNumberString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({ description: 'Date of the transfer in ISO format', example: '2023-10-25' })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({ description: 'Optional note or description' })
  @IsString()
  @IsOptional()
  description?: string;
}
