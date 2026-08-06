export interface CurrencyAmountDto {
  currency: string;
  amount: number;
}

export interface DashboardSummaryDto {
  total_balance: CurrencyAmountDto[];
  reserved_funds: CurrencyAmountDto[];
  blocked_funds: CurrencyAmountDto[];
  third_party_funds: CurrencyAmountDto[];
  available_balance: CurrencyAmountDto[];
}
