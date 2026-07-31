import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { prismaTransactionStorage } from '../../../prisma/prisma-unit-of-work';
import { Money } from '@mymoney/shared';
import { IGoalRepository } from '../domain/goal.repository.interface';
import { Goal } from '../domain/goal.entity';
import { GoalStatus } from '../domain/goal-status.enum';

@Injectable()
export class PrismaGoalRepository implements IGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient() {
    return prismaTransactionStorage.getStore() || this.prisma;
  }

  async findById(id: string): Promise<Goal | null> {
    const record = await this.getClient().goal.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findAllByUser(userId: string): Promise<Goal[]> {
    const records = await this.getClient().goal.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return records.map(record => this.mapToDomain(record));
  }

  async findActiveByUser(userId: string): Promise<Goal[]> {
    const records = await this.getClient().goal.findMany({
      where: { 
        user_id: userId,
        status: GoalStatus.ACTIVE,
      },
      orderBy: { created_at: 'desc' },
    });

    return records.map(record => this.mapToDomain(record));
  }

  async save(goal: Goal): Promise<void> {
    const data = {
      user_id: goal.userId,
      name: goal.name,
      target_amount: goal.targetAmount.value.toString(),
      current_amount: goal.currentAmount.value.toString(),
      currency: goal.targetAmount.currency,
      target_date: goal.targetDate,
      status: goal.status,
      updated_at: goal.updatedAt,
    };

    await this.getClient().goal.upsert({
      where: { id: goal.id },
      create: {
        id: goal.id,
        ...data,
        created_at: goal.createdAt,
      },
      update: data,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(record: any): Goal {
    return Goal.reconstitute({
      id: record.id,
      userId: record.user_id,
      name: record.name,
      targetAmount: Money.of(record.target_amount, record.currency),
      currentAmount: Money.of(record.current_amount, record.currency),
      targetDate: record.target_date,
      status: record.status as GoalStatus,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }
}
