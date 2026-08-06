import { IsString, IsEnum, IsOptional, IsNotEmpty, Matches, IsNumberString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../domain/account-type.enum';
import { Currency } from '@mymoney/shared';

export class CreateAccountDto {
  @ApiProperty({ example: 'Cartera' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CASH })
  @IsEnum(AccountType)
  type!: AccountType;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  currency!: Currency;

  @ApiProperty({ example: '150.00', description: 'Initial balance amount as string to avoid precision issues' })
  @IsNumberString()
  initial_balance!: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex code (e.g. #FFFFFF)' })
  color?: string;

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'ID of the financial institution' })
  @IsOptional()
  @IsUUID()
  institution_id?: string;

  @ApiPropertyOptional({ description: 'Specific type, e.g. Ahorro Flexible' })
  @IsOptional()
  @IsString()
  specific_type?: string;
}
