import { IsString, IsOptional, Matches, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Nueva Cartera' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '150.00', description: 'Initial balance amount. Will fail if account has transactions.' })
  @IsOptional()
  @IsNumberString()
  initial_balance?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex code (e.g. #FFFFFF)' })
  color?: string;

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  icon?: string;
}
