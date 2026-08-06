export type TransactionType = 'INCOME' | 'EXPENSE';

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
  is_third_party: boolean;
  third_party_owner: string | null;
  third_party_note: string | null;
  payment_method: string | null;
  card_id: string | null;
  subscription_id: string | null;
  product_id: string | null;
  account?: {
    id?: string;
    name?: string;
    icon?: string;
  } | null;
  category?: {
    id?: string;
    name?: string;
    icon?: string;
  } | null;
}

export interface CreateTransactionDto {
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: string;
  date: string;
  description?: string;
  is_third_party?: boolean;
  third_party_owner?: string;
  third_party_note?: string;
  payment_method?: string;
  card_id?: string;
  subscription_id?: string;
  product_id?: string;
}

export interface CreateTransferDto {
  from_account_id: string;
  to_account_id: string;
  amount: string;
  date: string;
  description?: string;
}

export interface UpdateTransactionDto {
  category_id?: string;
  amount?: string;
  date?: string;
  description?: string;
  is_third_party?: boolean;
  third_party_owner?: string;
  third_party_note?: string;
  payment_method?: string;
  card_id?: string;
  subscription_id?: string;
  product_id?: string;
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
