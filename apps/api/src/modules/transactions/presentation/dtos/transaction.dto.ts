import { Transaction } from '../../domain/transaction.entity';

export class MoneyDto {
  value!: string;
  currency!: string;
}

export class TransactionDto {
  id!: string;
  account_id!: string;
  category_id!: string | null;
  type!: string;
  amount!: MoneyDto;
  date!: string;
  description!: string | null;
  is_transfer!: boolean;

  static fromDomain(entity: Transaction): TransactionDto {
    return {
      id: entity.id,
      account_id: entity.accountId,
      category_id: entity.categoryId,
      type: entity.type,
      amount: {
        value: entity.amount.value.toString(),
        currency: entity.amount.currency,
      },
      date: entity.date.toISOString().split('T')[0],
      description: entity.description,
      is_transfer: entity.isTransfer,
    };
  }
}

export class TransferPairDto {
  transfer_pair_id!: string;
  source_transaction!: TransactionDto;
  destination_transaction!: TransactionDto;
}

export class TransactionPaginatedResponseDto {
  data!: TransactionDto[];
  meta!: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
