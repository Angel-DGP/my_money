import { Money } from '@mymoney/shared';

export class BudgetVelocityCalculator {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date,
    private readonly amount: Money,
    private readonly executedAmount: Money
  ) {}

  public get durationInDays(): number {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1); // +1 to include both start and end dates
  }

  public get daysElapsed(): number {
    const today = new Date();
    if (today < this.startDate) return 0;
    if (today > this.endDate) return this.durationInDays;
    const timeDiff = today.getTime() - this.startDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  public get dailyExpectedVelocity(): Money {
    if (this.durationInDays === 0) return Money.zero(this.amount.currency);
    return Money.of(this.amount.value.div(this.durationInDays), this.amount.currency);
  }

  public get dailyActualVelocity(): Money {
    const elapsed = this.daysElapsed;
    if (elapsed === 0) return Money.zero(this.executedAmount.currency);
    return Money.of(this.executedAmount.value.div(elapsed), this.executedAmount.currency);
  }

  public get projectedEndAmount(): Money {
    if (this.daysElapsed === 0) return Money.zero(this.amount.currency);
    const daily = this.dailyActualVelocity;
    return Money.of(daily.value.mul(this.durationInDays), daily.currency);
  }

  public get statusIndicator(): 'ACCELERATED' | 'NORMAL' | 'SLOW' {
    const projected = this.projectedEndAmount;
    // Accelerated if projected exceeds budget amount
    if (projected.value.gt(this.amount.value)) {
      return 'ACCELERATED';
    }
    // Slow if projected is less than 80% of budget amount
    if (projected.value.lt(this.amount.value.mul(0.8))) {
      return 'SLOW';
    }
    return 'NORMAL';
  }
}
