import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ITransactionRepository } from '../../domain/transaction.repository.interface';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionType } from '../../domain/transaction-type.enum';
import { Money } from '@mymoney/shared';
import { prismaTransactionStorage } from '../../../../prisma/prisma-unit-of-work';
import { Prisma } from '@mymoney/db';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly defaultPrisma: PrismaService) {}

  private get prisma(): Prisma.TransactionClient {
    return prismaTransactionStorage.getStore() ?? this.defaultPrisma;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(raw: any): Transaction {
    return Transaction.reconstitute({
      id: raw.id,
      userId: raw.user_id,
      accountId: raw.account_id,
      categoryId: raw.category_id,
      type: raw.type as TransactionType,
      amount: Money.of(raw.amount, raw.currency),
      description: raw.description,
      date: new Date(raw.date),
      transferPairId: raw.transfer_pair_id,
      isRecurring: raw.is_recurring,
      isThirdParty: raw.is_third_party,
      thirdPartyOwner: raw.third_party_owner,
      thirdPartyNote: raw.third_party_note,
      paymentMethod: raw.payment_method,
      cardId: raw.card_id,
      subscriptionId: raw.subscription_id,
      productId: raw.product_id,
      createdAt: raw.created_at,
      createdBy: raw.created_by,
      updatedAt: raw.updated_at,
      updatedBy: raw.updated_by,
      deletedAt: raw.deleted_at,
      deletedBy: raw.deleted_by,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toPersistence(entity: Transaction): any {
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

  async findById(id: string, userId: string): Promise<Transaction | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: {
        id,
        user_id: userId,
        deleted_at: null,
      },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async save(entity: Transaction): Promise<void> {
    const data = this.toPersistence(entity);
    await this.prisma.transaction.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: {
        id,
        user_id: userId,
        deleted_at: null,
      },
    });
    return count > 0;
  }

  async softDelete(id: string, userId: string, deletedBy: string): Promise<void> {
    await this.prisma.transaction.updateMany({
      where: {
        id,
        user_id: userId,
      },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
        updated_at: new Date(),
        updated_by: deletedBy,
      },
    });
  }

  async findByTransferPairId(transferPairId: string, userId: string): Promise<Transaction[]> {
    const raw = await this.prisma.transaction.findMany({
      where: {
        transfer_pair_id: transferPairId,
        user_id: userId,
      },
    });
    return raw.map(r => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findMany(userId: string, filters: any, skip: number, take: number): Promise<[Transaction[], number]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      user_id: userId,
      deleted_at: null,
    };

    if (filters.account_id) where.account_id = filters.account_id;
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.type) where.type = filters.type;
    
    // date ranges
    if (filters.start_date || filters.end_date) {
      where.date = {};
      if (filters.start_date) where.date.gte = new Date(filters.start_date);
      if (filters.end_date) where.date.lte = new Date(filters.end_date);
    }

    const [raw, count] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: [
          { date: 'desc' },
          { created_at: 'desc' }
        ],
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return [raw.map(r => this.toDomain(r)), count];
  }
}
