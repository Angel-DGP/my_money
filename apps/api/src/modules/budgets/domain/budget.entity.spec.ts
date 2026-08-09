import { Budget, BudgetPeriod, BudgetStatus } from './budget.entity';
import { Money, BalanceDelta } from '@mymoney/shared';
import { 
  InvalidBudgetAmountException
} from './exceptions/budget.exceptions';

describe('Budget Entity', () => {
  const defaultProps = {
    userId: 'user-123',
    categoryId: 'cat-456',
    period: BudgetPeriod.MONTHLY,
    amount: Money.of(500, 'USD'),
    startDate: new Date('2026-07-01T00:00:00Z'),
  };

  it('should create a valid monthly budget with correct endDate', () => {
    const budget = Budget.create(defaultProps);

    expect(budget.userId).toBe('user-123');
    expect(budget.period).toBe(BudgetPeriod.MONTHLY);
    expect(budget.status).toBe(BudgetStatus.ACTIVE);
    expect(budget.amount.value.toNumber()).toBe(500);
    expect(budget.executedAmount.value.toNumber()).toBe(0);
    expect(budget.endDate.toISOString().startsWith('2026-07-31')).toBeTruthy();
  });

  it('should apply transaction delta and emit threshold events', () => {
    const budget = Budget.create(defaultProps);
    
    // Add 400 (80% of 500)
    budget.applyTransactionDelta(BalanceDelta.increase(Money.of(400, 'USD')), new Date('2026-07-15T00:00:00Z'));
    
    expect(budget.executedAmount.value.toNumber()).toBe(400);
    expect(budget.executionPercentage()).toBe(80);
    
    const events = budget.getDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('BudgetThresholdReached');
    
    budget.clearDomainEvents();
    
    // Add 150 more (Total 550, exceeds 100%)
    budget.applyTransactionDelta(BalanceDelta.increase(Money.of(150, 'USD')), new Date('2026-07-16T00:00:00Z'));
    expect(budget.executedAmount.value.toNumber()).toBe(550);
    expect(budget.isOverBudget()).toBeTruthy();
    
    const events2 = budget.getDomainEvents();
    expect(events2.length).toBe(1);
    expect(events2[0].type).toBe('BudgetExceeded');
  });

  it('should not throw if amount is valid', () => {
    expect(() => Budget.create(defaultProps)).not.toThrow();
  });

  it('should throw if amount is zero or negative', () => {
    expect(() => Budget.create({ ...defaultProps, amount: Money.of(0, 'USD') }))
      .toThrow(InvalidBudgetAmountException);
  });
});
