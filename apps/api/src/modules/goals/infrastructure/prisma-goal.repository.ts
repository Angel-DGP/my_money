import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { prismaTransactionStorage } from '../../../prisma/prisma-unit-of-work';
import { Money, Currency } from '@mymoney/shared';
import { IGoalRepository } from '../domain/goal.repository.interface';
import { Goal } from '../domain/goal.entity';
import { GoalStatus } from '../domain/goal-status.enum';

interface RawGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: unknown;
  current_amount: unknown;
  currency: string;
  target_date: Date | null;
  status: string;
  description: string | null;
  priority: number;
  color: string | null;
  icon: string | null;
  account_id: string | null;
  created_at: Date;
  updated_at: Date;
}

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
      description: goal.description,
      priority: goal.priority,
      color: goal.color,
      icon: goal.icon,
      account_id: goal.accountId,
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

  private mapToDomain(record: RawGoal): Goal {
    return Goal.reconstitute({
      id: record.id,
      userId: record.user_id,
      name: record.name,
      targetAmount: Money.of(String(record.target_amount), record.currency as Currency),
      currentAmount: Money.of(String(record.current_amount), record.currency as Currency),
      targetDate: record.target_date,
      status: record.status as GoalStatus,
      description: record.description,
      priority: record.priority,
      color: record.color,
      icon: record.icon,
      accountId: record.account_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }
}
