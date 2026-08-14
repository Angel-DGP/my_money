import { IRepository } from '@mymoney/shared';
import { Budget, BudgetPeriod } from './budget.entity';

export const BUDGET_REPOSITORY = Symbol('BUDGET_REPOSITORY');

export interface IBudgetRepository extends IRepository<Budget, string> {
  findAllByUser(userId: string): Promise<Budget[]>;
  findActiveByUser(userId: string): Promise<Budget[]>;
  findByCategory(categoryId: string, userId: string): Promise<Budget[]>;
  findActiveByCategoryAndDate(categoryId: string, userId: string, date: Date): Promise<Budget | null>;
  existsActiveBudget(userId: string, categoryId: string, period: BudgetPeriod, startDate: Date): Promise<boolean>;
  delete(id: string, userId: string): Promise<void>;
}
