import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ITransactionRepository } from '../../domain/transaction.repository.interface';
import { Transaction } from '../../domain/transaction.entity';
import { prismaTransactionStorage } from '../../../../prisma/prisma-unit-of-work';
import { Prisma } from '@mymoney/db';
import { TransactionMapper, RawTransaction } from './transaction.mapper';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly defaultPrisma: PrismaService) {}

  private get prisma(): Prisma.TransactionClient {
    return prismaTransactionStorage.getStore() ?? this.defaultPrisma;
  }

  async findById(id: string, userId: string): Promise<Transaction | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: {
        id,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        account: true,
        category: true,
        installment: true,
      },
    });
    if (!raw) return null;
    return TransactionMapper.toDomain(raw as unknown as RawTransaction);
  }

  async save(entity: Transaction): Promise<void> {
    const createData = TransactionMapper.toCreateInput(entity);
    const updateData = TransactionMapper.toUpdateInput(entity);
    await this.prisma.transaction.upsert({
      where: { id: entity.id },
      create: createData,
      update: updateData,
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
      include: {
        account: true,
        category: true,
        installment: true,
      },
    });
    return raw.map(r => TransactionMapper.toDomain(r as unknown as RawTransaction));
  }

  async findMany(userId: string, filters: Record<string, unknown>, skip: number, take: number): Promise<[Transaction[], number]> {
    const where: Prisma.TransactionWhereInput = {
      user_id: userId,
      deleted_at: null,
    };

    if (filters.account_id) {
      where.account_id = filters.account_id as string;
    }

    if (filters.category_id) {
      if (filters.category_id === 'SYSTEM_TRANSFER' || filters.category_id === 'transfer') {
        where.transfer_pair_id = { not: null };
      } else {
        const targetId = filters.category_id as string;
        const allCategoryIds = [targetId];
        let queue = [targetId];
        while (queue.length > 0) {
          const children = await this.prisma.category.findMany({
            where: {
              parent_id: { in: queue },
              deleted_at: null,
            },
            select: { id: true },
          });
          if (children.length === 0) break;
          const newIds = children.map(c => c.id);
          allCategoryIds.push(...newIds);
          queue = newIds;
        }
        where.category_id = { in: allCategoryIds };
      }
    }

    if (filters.type) {
      if (filters.type === 'TRANSFER') {
        where.transfer_pair_id = { not: null };
      } else if (filters.type === 'INCOME') {
        where.type = 'INCOME';
        where.transfer_pair_id = null;
      } else if (filters.type === 'EXPENSE') {
        where.type = 'EXPENSE';
        where.transfer_pair_id = null;
      } else {
        where.type = filters.type as string;
      }
    }
    
    // date ranges
    if (filters.start_date || filters.end_date) {
      where.date = {};
      if (filters.start_date) {
        const startStr = String(filters.start_date).trim();
        where.date.gte = startStr.includes('T')
          ? new Date(startStr)
          : new Date(`${startStr}T00:00:00-05:00`);
      }
      if (filters.end_date) {
        const endStr = String(filters.end_date).trim();
        where.date.lte = endStr.includes('T')
          ? new Date(endStr)
          : new Date(`${endStr}T23:59:59.999-05:00`);
      }
    }

    const [raw, count] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        include: {
          account: true,
          category: true,
          installment: true,
        },
        orderBy: [
          { date: 'desc' },
          { created_at: 'desc' }
        ],
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return [raw.map(r => TransactionMapper.toDomain(r as unknown as RawTransaction)), count];
  }
}
