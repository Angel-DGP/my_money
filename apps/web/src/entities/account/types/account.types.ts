export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT';
export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Money {
  value: string;
  currency: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  current_balance: Money;
  color?: string | null;
  icon?: string | null;
}

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  currency: Currency;
  initial_balance: string;
  color?: string;
  icon?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {}
