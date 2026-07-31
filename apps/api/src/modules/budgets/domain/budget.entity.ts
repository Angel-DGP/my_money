import { randomUUID } from 'crypto';
import { Money, BalanceDelta } from '@mymoney/shared';
import { 
  InvalidBudgetAmountException, 
  InvalidAlertThresholdException, 
  BudgetNotActiveException
} from './exceptions/budget.exceptions';
import { BudgetThresholdReachedEvent } from './events/budget-threshold-reached.event';
import { BudgetExceededEvent } from './events/budget-exceeded.event';
import { BudgetExpiredEvent } from './events/budget-expired.event';

export enum BudgetPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

export interface CreateBudgetProps {
  userId: string;
  categoryId: string;
  period: BudgetPeriod;
  amount: Money;
  startDate: Date;
  alertThreshold?: number;
}

export interface BudgetProps {
  id: string;
  userId: string;
  categoryId: string;
  period: BudgetPeriod;
  amount: Money;
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
  executedAmount: Money;
  status: BudgetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Budget {
  private props: BudgetProps;
  private domainEvents: unknown[] = [];

  private constructor(props: BudgetProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get categoryId(): string { return this.props.categoryId; }
  get period(): BudgetPeriod { return this.props.period; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get amount(): Money { return this.props.amount; }
  get alertThreshold(): number { return this.props.alertThreshold; }
  get executedAmount(): Money { return this.props.executedAmount; }
  get status(): BudgetStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Events
  public getDomainEvents(): unknown[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  static create(props: CreateBudgetProps): Budget {
    if (props.amount.value.lte(0)) {
      throw new InvalidBudgetAmountException();
    }
    const alertThreshold = props.alertThreshold ?? 80;
    if (alertThreshold < 1 || alertThreshold > 100) {
      throw new InvalidAlertThresholdException();
    }

    const startDate = new Date(props.startDate);
    let endDate: Date;
    switch (props.period) {
      case BudgetPeriod.WEEKLY:
        endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 6);
        break;
      case BudgetPeriod.MONTHLY:
        endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0)); // last day of month
        break;
      case BudgetPeriod.YEARLY:
        endDate = new Date(Date.UTC(startDate.getUTCFullYear(), 11, 31)); // Dec 31st of the start year
        break;
    }
    
    return new Budget({
      id: randomUUID(),
      userId: props.userId,
      categoryId: props.categoryId,
      period: props.period,
      amount: props.amount,
      startDate,
      endDate,
      alertThreshold,
      executedAmount: Money.zero(props.amount.currency),
      status: BudgetStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: BudgetProps): Budget {
    return new Budget(props);
  }

  public updateAmount(newAmount: Money): void {
    if (newAmount.value.lte(0)) {
      throw new InvalidBudgetAmountException();
    }
    if (this.props.status !== BudgetStatus.ACTIVE) {
      throw new BudgetNotActiveException();
    }
    this.props.amount = newAmount;
    this.props.updatedAt = new Date();
  }

  public updateAlertThreshold(threshold: number): void {
    if (threshold < 1 || threshold > 100) {
      throw new InvalidAlertThresholdException();
    }
    if (this.props.status !== BudgetStatus.ACTIVE) {
      throw new BudgetNotActiveException();
    }
    this.props.alertThreshold = threshold;
    this.props.updatedAt = new Date();
  }

  public applyTransactionDelta(delta: BalanceDelta, transactionDate: Date): void {
    if (!this.isActive() || !this.containsDate(transactionDate)) {
      return;
    }

    const previousPercentage = this.executionPercentage();

    if (delta.direction === 'INCREASE') {
      this.props.executedAmount = this.props.executedAmount.add(delta.amount);
    } else {
      this.props.executedAmount = this.props.executedAmount.subtract(delta.amount);
      if (this.props.executedAmount.value.lt(0)) {
        this.props.executedAmount = Money.zero(this.props.amount.currency);
      }
    }

    this.props.updatedAt = new Date();

    const newPercentage = this.executionPercentage();

    // Check thresholds
    if (previousPercentage < this.props.alertThreshold && newPercentage >= this.props.alertThreshold) {
      this.addDomainEvent(new BudgetThresholdReachedEvent({
        aggregateId: this.id,
        userId: this.userId,
        categoryId: this.categoryId,
        threshold: this.props.alertThreshold,
        executedAmount: { value: this.props.executedAmount.value.toString(), currency: this.props.executedAmount.currency },
        budgetAmount: { value: this.props.amount.value.toString(), currency: this.props.amount.currency },
      }));
    }

    if (previousPercentage < 100 && newPercentage >= 100) {
      this.addDomainEvent(new BudgetExceededEvent({
        aggregateId: this.id,
        userId: this.userId,
        categoryId: this.categoryId,
        executedAmount: { value: this.props.executedAmount.value.toString(), currency: this.props.executedAmount.currency },
        budgetAmount: { value: this.props.amount.value.toString(), currency: this.props.amount.currency },
        excessAmount: { value: this.props.executedAmount.subtract(this.props.amount).value.toString(), currency: this.props.amount.currency }
      }));
    }
  }

  public expire(): void {
    if (this.props.status !== BudgetStatus.ACTIVE) {
      throw new BudgetNotActiveException();
    }
    this.props.status = BudgetStatus.EXPIRED;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new BudgetExpiredEvent({
      aggregateId: this.id,
      userId: this.userId,
      categoryId: this.categoryId,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public deactivate(_reason: 'CATEGORY_DELETED' | 'USER_REQUEST'): void {
    if (this.props.status !== BudgetStatus.ACTIVE) {
      throw new BudgetNotActiveException();
    }
    this.props.status = BudgetStatus.INACTIVE;
    this.props.updatedAt = new Date();
  }

  public reactivate(): void {
    if (this.props.status !== BudgetStatus.INACTIVE) {
      // Re-use BudgetNotActiveException or maybe create a BudgetAlreadyActiveException?
      // Actually, if it's expired, we shouldn't reactivate it. If it's active, it's a no-op or throw.
      // We will throw if it's not INACTIVE.
      if (this.props.status === BudgetStatus.ACTIVE) {
        return; // Idempotent
      }
      throw new Error('Only inactive budgets can be reactivated');
    }
    this.props.status = BudgetStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  public executionPercentage(): number {
    return this.props.executedAmount.value.div(this.props.amount.value).mul(100).toNumber();
  }

  public remainingAmount(): Money {
    return this.props.amount.subtract(this.props.executedAmount);
  }

  public availableAmount(): Money {
    const remaining = this.remainingAmount();
    return remaining.value.lt(0) ? Money.zero(this.props.amount.currency) : remaining;
  }

  public isOverBudget(): boolean {
    return this.props.executedAmount.value.gt(this.props.amount.value);
  }

  public isActive(): boolean {
    return this.props.status === BudgetStatus.ACTIVE;
  }

  public containsDate(date: Date): boolean {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(this.props.startDate).setHours(0, 0, 0, 0);
    const end = new Date(this.props.endDate).setHours(0, 0, 0, 0);
    return d >= start && d <= end;
  }

  public belongsToUser(userId: string): boolean {
    return this.props.userId === userId;
  }
}
