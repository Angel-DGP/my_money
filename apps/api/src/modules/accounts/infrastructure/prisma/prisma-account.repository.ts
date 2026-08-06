import { Injectable } from '@nestjs/common';
import { Account as PrismaAccount } from '@mymoney/db';
import { IAccountRepository } from '../../domain/interfaces/account.repository.interface';
import { Account } from '../../domain/account.entity';
import { Currency, Money } from '@mymoney/shared';
import { AccountType } from '../../domain/account-type.enum';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: PrismaAccount): Account {
    return Account.reconstitute({
      id: raw.id,
      userId: raw.user_id,
      name: raw.name,
      type: raw.type as AccountType,
      currency: raw.currency as Currency,
      initialBalance: Money.of(raw.initial_balance.toString(), raw.currency as Currency),
      currentBalance: Money.of(raw.current_balance.toString(), raw.currency as Currency),
      color: raw.color,
      icon: raw.icon,
      institutionId: raw.institution_id,
      specificType: raw.specific_type,
      isActive: raw.is_active,
      createdAt: raw.created_at,
      createdBy: raw.created_by,
      updatedAt: raw.updated_at,
      updatedBy: raw.updated_by,
      deletedAt: raw.deleted_at,
      deletedBy: raw.deleted_by,
    });
  }

  async findById(id: string, userId: string): Promise<Account | null> {
    const raw = await this.prisma.account.findFirst({
      where: { 
        id, 
        user_id: userId,
        deleted_at: null 
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const count = await this.prisma.account.count({
      where: { id, user_id: userId, deleted_at: null }
    });
    return count > 0;
  }

  async softDelete(id: string, userId: string, deletedBy: string): Promise<void> {
    await this.prisma.account.updateMany({
      where: { id, user_id: userId },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
        updated_at: new Date(),
        updated_by: deletedBy,
        is_active: false
      }
    });
  }

  async findAllActiveByUser(userId: string): Promise<Account[]> {
    const rawList = await this.prisma.account.findMany({
      where: { 
        user_id: userId,
        deleted_at: null 
      },
      orderBy: { name: 'asc' },
    });
    return rawList.map(raw => this.toDomain(raw));
  }

  async save(account: Account): Promise<void> {
    const data = {
      user_id: account.userId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      initial_balance: account.initialBalance.value.toFixed(4),
      current_balance: account.currentBalance.value.toFixed(4),
      color: account.color,
      icon: account.icon,
      institution_id: account.institutionId,
      specific_type: account.specificType,
      is_active: account.isActive(),
      created_by: account.createdBy,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updated_at: (account as any)._updatedAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updated_by: (account as any)._updatedBy,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deleted_at: (account as any)._deletedAt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deleted_by: (account as any)._deletedBy,
    };

    await this.prisma.account.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        created_at: account.createdAt,
        ...data,
      },
      update: data,
    });
  }

  async hasTransactions(accountId: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: { account_id: accountId },
    });
    return count > 0;
  }

  async existsByNameAndUser(name: string, userId: string): Promise<boolean> {
    const count = await this.prisma.account.count({
      where: { 
        name, 
        user_id: userId,
        deleted_at: null
      },
    });
    return count > 0;
  }
}
