export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Money {
  value: string;
  currency: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: Money;
  date: string;
  description: string | null;
  is_transfer: boolean;
}

export interface CreateTransactionDto {
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: string;
  date: string;
  description?: string;
}

export interface UpdateTransactionDto {
  category_id?: string;
  amount?: string;
  date?: string;
  description?: string;
}

export interface CreateTransferDto {
  source_account_id: string;
  destination_account_id: string;
  amount: string;
  destination_amount: string;
  date: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
