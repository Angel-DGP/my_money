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
  is_third_party!: boolean;
  third_party_owner!: string | null;
  third_party_note!: string | null;
  payment_method!: string | null;
  card_id!: string | null;
  subscription_id!: string | null;
  product_id!: string | null;
  transfer_pair_id!: string | null;
  installment?: {
    total_installments: number;
    interest_rate: number | null;
    grace_months: number;
  } | null;
  account!: { id: string; name: string; icon: string | null } | null;
  category!: { id: string; name: string; icon: string | null } | null;

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
      is_third_party: entity.isThirdParty,
      third_party_owner: entity.thirdPartyOwner,
      third_party_note: entity.thirdPartyNote,
      payment_method: entity.paymentMethod,
      card_id: entity.cardId,
      subscription_id: entity.subscriptionId,
      product_id: entity.productId,
      transfer_pair_id: entity.transferPairId,
      installment: entity.installment ? {
        total_installments: entity.installment.totalInstallments,
        interest_rate: entity.installment.interestRate,
        grace_months: entity.installment.graceMonths,
      } : null,
      account: entity.account ? { id: entity.account.id, name: entity.account.name, icon: entity.account.icon } : null,
      category: entity.category ? { id: entity.category.id, name: entity.category.name, icon: entity.category.icon } : null,
    };
  }
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
