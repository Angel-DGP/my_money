export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Money {
  value: string;
  currency: string;
}

export interface TransactionInstallment {
  total_installments: number;
  /** Backend retorna `number | null`; NO usar como string */
  interest_rate?: number | null;
  grace_months?: number;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  transfer_pair_id: string | null;
  type: TransactionType | 'TRANSFER';
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
  installment?: TransactionInstallment | null;
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
  installment?: TransactionInstallment;
}

export interface CreateTransferDto {
  from_account_id: string;
  to_account_id: string;
  amount: string;
  date: string;
  description?: string;
}

export interface UpdateTransactionDto {
  category_id?: string | null;
  amount?: string;
  date?: string;
  description?: string;
  is_third_party?: boolean;
  third_party_owner?: string | null;
  third_party_note?: string | null;
  payment_method?: string | null;
  card_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
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
