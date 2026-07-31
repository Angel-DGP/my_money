import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Money } from '@mymoney/shared';
import { Budget, BudgetPeriod, BudgetStatus } from '../domain/budget.entity';
import { IBudgetRepository } from '../domain/budget.repository.interface';

@Injectable()
export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async softDelete(_id: string, _userId: string, _deletedBy: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async save(budget: Budget): Promise<void> {
    await this.prisma.budget.upsert({
      where: { id: budget.id },
      update: {
        amount: budget.amount.value.toNumber(),
        currency: budget.amount.currency,
        alert_threshold: budget.alertThreshold,
        executed_amount: budget.executedAmount.value.toNumber(),
        status: budget.status,
        updated_at: budget.updatedAt,
      },
      create: {
        id: budget.id,
        user_id: budget.userId,
        category_id: budget.categoryId,
        period: budget.period,
        amount: budget.amount.value.toNumber(),
        currency: budget.amount.currency,
        alert_threshold: budget.alertThreshold,
        executed_amount: budget.executedAmount.value.toNumber(),
        status: budget.status,
        start_date: budget.startDate,
        end_date: budget.endDate,
        created_at: budget.createdAt,
        updated_at: budget.updatedAt,
      },
    });
  }

  async findById(id: string, userId: string): Promise<Budget | null> {
    const data = await this.prisma.budget.findFirst({
      where: { id, user_id: userId },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.budget.count({ where: { id } });
    return count > 0;
  }

  async findAllByUser(userId: string): Promise<Budget[]> {
    const data = await this.prisma.budget.findMany({
      where: { user_id: userId },
      orderBy: { start_date: 'desc' },
    });
    return data.map(this.toDomain);
  }

  async findActiveByUser(userId: string): Promise<Budget[]> {
    const data = await this.prisma.budget.findMany({
      where: { user_id: userId, status: 'ACTIVE' },
      orderBy: { start_date: 'desc' },
    });
    return data.map(this.toDomain);
  }

  async findByCategory(categoryId: string, userId: string): Promise<Budget[]> {
    const data = await this.prisma.budget.findMany({
      where: { category_id: categoryId, user_id: userId },
      orderBy: { start_date: 'desc' },
    });
    return data.map(this.toDomain);
  }

  async findActiveByCategoryAndDate(categoryId: string, userId: string, date: Date): Promise<Budget | null> {
    // Ensuring the date has time stripped for accurate range check in prisma if they are stored as Dates
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const data = await this.prisma.budget.findFirst({
      where: {
        category_id: categoryId,
        user_id: userId,
        status: 'ACTIVE',
        start_date: { lte: d },
        end_date: { gte: d },
      },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async existsActiveBudget(userId: string, categoryId: string, period: BudgetPeriod, startDate: Date): Promise<boolean> {
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);

    const count = await this.prisma.budget.count({
      where: {
        user_id: userId,
        category_id: categoryId,
        period,
        start_date: d,
        status: 'ACTIVE',
      },
    });
    return count > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): Budget {
    return Budget.reconstitute({
      id: data.id,
      userId: data.user_id,
      categoryId: data.category_id,
      period: data.period as BudgetPeriod,
      amount: Money.of(data.amount.toString(), data.currency),
      startDate: data.start_date,
      endDate: data.end_date,
      alertThreshold: data.alert_threshold,
      executedAmount: Money.of(data.executed_amount.toString(), data.currency),
      status: data.status as BudgetStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
