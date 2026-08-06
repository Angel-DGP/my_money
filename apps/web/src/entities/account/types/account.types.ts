export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'CREDIT' | 'INVESTMENT';
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
  institution_id?: string | null;
  specific_type?: string | null;
}

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  currency: Currency;
  initial_balance: string;
  color?: string;
  icon?: string;
  institution_id?: string;
  specific_type?: string;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {}
