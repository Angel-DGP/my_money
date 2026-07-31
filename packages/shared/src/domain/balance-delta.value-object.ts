import { Money } from './money.value-object.js';

export enum BalanceDirection {
  INCREASE = 'INCREASE',  // The balance goes up (INCOME, destination of TRANSFER)
  DECREASE = 'DECREASE',  // The balance goes down (EXPENSE, source of TRANSFER)
}

export class BalanceDelta {
  private constructor(
    public readonly amount: Money,
    public readonly direction: BalanceDirection
  ) {}

  static increase(amount: Money): BalanceDelta {
    return new BalanceDelta(amount, BalanceDirection.INCREASE);
  }

  static decrease(amount: Money): BalanceDelta {
    return new BalanceDelta(amount, BalanceDirection.DECREASE);
  }

  reverse(): BalanceDelta {
    return new BalanceDelta(
      this.amount,
      this.direction === BalanceDirection.INCREASE ? BalanceDirection.DECREASE : BalanceDirection.INCREASE
    );
  }

  applyTo(currentBalance: Money): Money {
    if (this.direction === BalanceDirection.INCREASE) {
      return currentBalance.add(this.amount);
    } else {
      return currentBalance.subtract(this.amount);
    }
  }
}
