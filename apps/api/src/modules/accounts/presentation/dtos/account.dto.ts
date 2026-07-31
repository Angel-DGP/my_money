import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../domain/account-type.enum';
import { Currency } from '@mymoney/shared';
import { Account } from '../../domain/account.entity';

export class MoneyDto {
  @ApiProperty({ example: '150.00' })
  value!: string;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class AccountDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Cartera' })
  name!: string;

  @ApiProperty({ enum: AccountType })
  type!: AccountType;

  @ApiProperty({ enum: Currency })
  currency!: Currency;

  @ApiProperty({ type: MoneyDto })
  current_balance!: MoneyDto;

  @ApiPropertyOptional({ example: '#10B981' })
  color?: string | null;

  @ApiPropertyOptional({ example: 'wallet' })
  icon?: string | null;

  static fromDomain(account: Account): AccountDto {
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      current_balance: account.currentBalance.toJSON(),
      color: account.color,
      icon: account.icon,
    };
  }
}
