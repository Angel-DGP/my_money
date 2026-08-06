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
  softLimit?: Money;
  hardLimit?: Money;
  carryOver?: boolean;
  ignoreRefunds?: boolean;
  ignoreTransfers?: boolean;
  isFrozen?: boolean;
  notes?: string;
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
  softLimit?: Money;
  hardLimit?: Money;
  carryOver: boolean;
  ignoreRefunds: boolean;
  ignoreTransfers: boolean;
  isFrozen: boolean;
  notes?: string;
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
  get softLimit(): Money | undefined { return this.props.softLimit; }
  get hardLimit(): Money | undefined { return this.props.hardLimit; }
  get carryOver(): boolean { return this.props.carryOver; }
  get ignoreRefunds(): boolean { return this.props.ignoreRefunds; }
  get ignoreTransfers(): boolean { return this.props.ignoreTransfers; }
  get isFrozen(): boolean { return this.props.isFrozen; }
  get notes(): string | undefined { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Virtual Computed Properties
  public get durationInDays(): number {
    const timeDiff = this.props.endDate.getTime() - this.props.startDate.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1); // +1 to include both start and end dates
  }

  public get daysElapsed(): number {
    const today = new Date();
    if (today < this.props.startDate) return 0;
    if (today > this.props.endDate) return this.durationInDays;
    const timeDiff = today.getTime() - this.props.startDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  public get dailyExpectedVelocity(): Money {
    if (this.durationInDays === 0) return Money.zero(this.props.amount.currency);
    return Money.of(this.props.amount.value.div(this.durationInDays), this.props.amount.currency);
  }

  public get dailyActualVelocity(): Money {
    const elapsed = this.daysElapsed;
    if (elapsed === 0) return Money.zero(this.props.executedAmount.currency);
    return Money.of(this.props.executedAmount.value.div(elapsed), this.props.executedAmount.currency);
  }

  public get projectedEndAmount(): Money {
    if (this.daysElapsed === 0) return Money.zero(this.props.amount.currency);
    const daily = this.dailyActualVelocity;
    return Money.of(daily.value.mul(this.durationInDays), daily.currency);
  }

  public get statusIndicator(): 'ACCELERATED' | 'NORMAL' | 'SLOW' {
    const projected = this.projectedEndAmount;
    // Accelerated if projected exceeds budget amount
    if (projected.value.gt(this.props.amount.value)) {
      return 'ACCELERATED';
    }
    // Slow if projected is less than 80% of budget amount
    if (projected.value.lt(this.props.amount.value.mul(0.8))) {
      return 'SLOW';
    }
    return 'NORMAL';
  }

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
      softLimit: props.softLimit,
      hardLimit: props.hardLimit,
      carryOver: props.carryOver ?? false,
      ignoreRefunds: props.ignoreRefunds ?? false,
      ignoreTransfers: props.ignoreTransfers ?? true,
      isFrozen: props.isFrozen ?? false,
      notes: props.notes,
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

  public updateSettings(settings: {
    softLimit?: Money;
    hardLimit?: Money;
    carryOver?: boolean;
    ignoreRefunds?: boolean;
    ignoreTransfers?: boolean;
    isFrozen?: boolean;
    notes?: string;
  }): void {
    if (this.props.status !== BudgetStatus.ACTIVE) {
      throw new BudgetNotActiveException();
    }
    if (settings.softLimit !== undefined) this.props.softLimit = settings.softLimit;
    if (settings.hardLimit !== undefined) this.props.hardLimit = settings.hardLimit;
    if (settings.carryOver !== undefined) this.props.carryOver = settings.carryOver;
    if (settings.ignoreRefunds !== undefined) this.props.ignoreRefunds = settings.ignoreRefunds;
    if (settings.ignoreTransfers !== undefined) this.props.ignoreTransfers = settings.ignoreTransfers;
    if (settings.isFrozen !== undefined) this.props.isFrozen = settings.isFrozen;
    if (settings.notes !== undefined) this.props.notes = settings.notes;
    
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
    return Number(
      this.props.executedAmount.value
        .div(this.props.amount.value)
        .mul(100)
        .toFixed(2)
    );
  }

  public isFrozenState(): boolean {
    return this.props.isFrozen;
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
