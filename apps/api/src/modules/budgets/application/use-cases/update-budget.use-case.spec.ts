import { UpdateBudgetUseCase } from './update-budget.use-case';
import { Money } from '@mymoney/shared';
import { NotFoundException } from '@nestjs/common';
import { BudgetStatus, BudgetPeriod } from '../../domain/budget.entity';

describe('UpdateBudgetUseCase', () => {
  let useCase: UpdateBudgetUseCase;
  let mockBudgetRepo: unknown;
  let mockUoW: unknown;
  let mockEventEmitter: unknown;
  let mockBudget: unknown;

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
    expect(mockBudget.updateAmount).toHaveBeenCalled();
    expect(mockBudget.updateAlertThreshold).toHaveBeenCalledWith(90);
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetUpdated', { type: 'BudgetUpdated' });
    expect(mockBudget.clearDomainEvents).toHaveBeenCalled();
  });
});
