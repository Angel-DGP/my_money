import { Transaction } from '../../domain/transaction.entity';
import { TransactionType } from '../../domain/transaction-type.enum';
import { Money, Currency } from '@mymoney/shared';
import { Prisma } from '@mymoney/db';

export interface RawTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: string;
  amount: number | string;
  currency: string;
  description: string | null;
  date: Date;
  transfer_pair_id: string | null;
  is_recurring: boolean;
  is_third_party: boolean;
  third_party_owner: string | null;
  third_party_note: string | null;
  payment_method: string | null;
  card_id: string | null;
  subscription_id: string | null;
  product_id: string | null;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
  account?: { id: string; name: string; icon: string | null } | null;
  category?: { id: string; name: string; icon: string | null } | null;
}

export class TransactionMapper {
  static toDomain(raw: RawTransaction): Transaction {
    return Transaction.reconstitute({
      id: raw.id,
      userId: raw.user_id,
      accountId: raw.account_id,
      categoryId: raw.category_id as string,
      type: raw.type as TransactionType,
      amount: Money.of(raw.amount as string, raw.currency as Currency),
      description: raw.description as string,
      date: new Date(raw.date),
      transferPairId: raw.transfer_pair_id as string,
      isRecurring: raw.is_recurring,
      isThirdParty: raw.is_third_party,
      thirdPartyOwner: raw.third_party_owner as string,
      thirdPartyNote: raw.third_party_note as string,
      paymentMethod: raw.payment_method as string,
      cardId: raw.card_id as string,
      subscriptionId: raw.subscription_id as string,
      productId: raw.product_id as string,
      createdAt: raw.created_at,
      createdBy: raw.created_by as string,
      updatedAt: raw.updated_at,
      updatedBy: raw.updated_by as string,
      deletedAt: raw.deleted_at as Date,
      deletedBy: raw.deleted_by as string,
      account: raw.account ? { id: raw.account.id, name: raw.account.name, icon: raw.account.icon } : null,
      category: raw.category ? { id: raw.category.id, name: raw.category.name, icon: raw.category.icon } : null,
    });
  }

  static toPersistence(entity: Transaction): Prisma.TransactionUncheckedCreateInput {
    return {
      id: entity.id,
      user_id: entity.userId,
      account_id: entity.accountId,
      category_id: entity.categoryId,
      type: entity.type,
      amount: entity.amount.value.toString(),
      currency: entity.amount.currency,
      description: entity.description,
      date: entity.date,
      transfer_pair_id: entity.transferPairId,
      is_recurring: entity.isRecurring,
      is_third_party: entity.isThirdParty,
      third_party_owner: entity.thirdPartyOwner,
      third_party_note: entity.thirdPartyNote,
      payment_method: entity.paymentMethod,
      card_id: entity.cardId,
      subscription_id: entity.subscriptionId,
      product_id: entity.productId,
      created_at: entity.createdAt,
      created_by: entity.createdBy,
      updated_at: entity.updatedAt,
      updated_by: entity.updatedBy,
      deleted_at: entity.deletedAt,
      deleted_by: entity.deletedBy,
    };
  }
}
