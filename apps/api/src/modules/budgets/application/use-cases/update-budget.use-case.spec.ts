import { DomainEvent } from '@mymoney/shared';
import { UpdateBudgetUseCase } from './update-budget.use-case';
import { Money, Currency } from '@mymoney/shared';
import { NotFoundException } from '@nestjs/common';
import { BudgetStatus, BudgetPeriod } from '../../domain/budget.entity';

describe('UpdateBudgetUseCase', () => {
  let useCase: UpdateBudgetUseCase;
  let mockBudgetRepo: Record<string, jest.Mock>;
  let mockUoW: Record<string, jest.Mock>;
  let mockEventEmitter: Record<string, jest.Mock>;
  let mockBudget: Record<string, jest.Mock>;

  beforeEach(() => {
    mockBudget = {
      id: 'budget-1',
      userId: 'user-1',
      categoryId: 'cat-1',
      status: BudgetStatus.ACTIVE,
      amount: Money.of('500', 'USD'),
      executedAmount: Money.zero('USD'),
      endDate: new Date('2030-01-01'), // Future date
      updateAmount: jest.fn(),
      updateAlertThreshold: jest.fn(),
      getDomainEvents: jest.fn().mockReturnValue([{ type: 'BudgetUpdated' }]),
      clearDomainEvents: jest.fn(),
      remainingAmount: jest.fn().mockReturnValue(Money.of('500', 'USD')),
      availableAmount: jest.fn().mockReturnValue(Money.of('500', 'USD')),
      executionPercentage: jest.fn().mockReturnValue(0),
      isOverBudget: jest.fn().mockReturnValue(false),
      createdAt: new Date(),
      updatedAt: new Date(),
      period: BudgetPeriod.MONTHLY,
      startDate: new Date('2030-01-01'),
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

    useCase = new UpdateBudgetUseCase(mockBudgetRepo, mockUoW, mockEventEmitter);
  });

  it('should throw NotFoundException if budget does not exist', async () => {
    mockBudgetRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'invalid-id', { amount: '1000' })).rejects.toThrow(NotFoundException);
  });

  it('should update amount and alert_threshold and emit domain events', async () => {
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    const result = await useCase.execute('user-1', 'budget-1', {
      amount: '1000',
      alert_threshold: 90
    });
    
    expect(result).toBeDefined();
    expect((mockBudget.updateAmount as jest.Mock)).toHaveBeenCalled();
    expect((mockBudget.updateAlertThreshold as jest.Mock)).toHaveBeenCalledWith(90);
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetUpdated', { type: 'BudgetUpdated' });
    expect((mockBudget.clearDomainEvents as jest.Mock)).toHaveBeenCalled();
  });
});
