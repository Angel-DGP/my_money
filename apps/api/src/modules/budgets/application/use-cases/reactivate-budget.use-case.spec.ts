import { ReactivateBudgetUseCase } from './reactivate-budget.use-case';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { BudgetStatus, BudgetPeriod } from '../../domain/budget.entity';
import { Money, Currency } from '@mymoney/shared';

describe('ReactivateBudgetUseCase', () => {
  let useCase: ReactivateBudgetUseCase;
  let mockBudgetRepo: any;
  let mockUoW: any;
  let mockEventEmitter: any;
  let mockBudget: any;

  beforeEach(() => {
    mockBudget = {
      id: 'budget-1',
      userId: 'user-1',
      categoryId: 'cat-1',
      status: BudgetStatus.INACTIVE,
      amount: Money.of('500', 'USD'),
      executedAmount: Money.zero('USD'),
      period: BudgetPeriod.MONTHLY,
      startDate: new Date('2030-01-01'),
      endDate: new Date('2030-01-31'),
      reactivate: jest.fn(),
      getDomainEvents: jest.fn().mockReturnValue([{ type: 'BudgetReactivated' }]),
      clearDomainEvents: jest.fn(),
      remainingAmount: jest.fn().mockReturnValue(Money.of('500', 'USD')),
      availableAmount: jest.fn().mockReturnValue(Money.of('500', 'USD')),
      executionPercentage: jest.fn().mockReturnValue(0),
      isOverBudget: jest.fn().mockReturnValue(false),
      createdAt: new Date(),
      updatedAt: new Date(),
      alertThreshold: 80,
      dailyExpectedVelocity: Money.of('10', 'USD'),
      dailyActualVelocity: Money.of('5', 'USD'),
      projectedEndAmount: Money.of('300', 'USD'),
      statusIndicator: 'NORMAL',
      carryOver: false,
      ignoreRefunds: false,
      ignoreTransfers: true,
      isFrozen: false,
      notes: undefined,
      softLimit: undefined,
      hardLimit: undefined,
      updateSettings: jest.fn(),

    };

    mockBudgetRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockUoW = {
      execute: jest.fn((cb) => cb()),
    };
    
    mockEventEmitter = {
      emit: jest.fn(),
    };

    useCase = new ReactivateBudgetUseCase(mockBudgetRepo, mockUoW, mockEventEmitter);
  });

  it('should throw NotFoundException if budget does not exist', async () => {
    mockBudgetRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw UnprocessableEntityException if budget is not inactive', async () => {
    mockBudget.reactivate.mockImplementation(() => {
      throw new Error('Only inactive budgets can be reactivated');
    });
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    await expect(useCase.execute('user-1', 'budget-1')).rejects.toThrow(UnprocessableEntityException);
  });

  it('should reactivate budget and emit domain events', async () => {
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    const result = await useCase.execute('user-1', 'budget-1');
    
    expect(result).toBeDefined();
    expect(mockBudget.reactivate).toHaveBeenCalled();
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetReactivated', { type: 'BudgetReactivated' });
    expect(mockBudget.clearDomainEvents).toHaveBeenCalled();
  });
});
