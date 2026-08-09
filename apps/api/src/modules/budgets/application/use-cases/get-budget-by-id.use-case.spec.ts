import { GetBudgetByIdUseCase } from './get-budget-by-id.use-case';
import { BudgetStatus } from '../../domain/budget.entity';
import { Money } from '@mymoney/shared';
import { NotFoundException } from '@nestjs/common';

describe('GetBudgetByIdUseCase', () => {
  let useCase: GetBudgetByIdUseCase;
  let mockBudgetRepo: Record<string, jest.Mock>;
  let mockUoW: Record<string, jest.Mock>;
  let mockEventEmitter: Record<string, jest.Mock>;
  let mockBudget: Record<string, jest.Mock>;
  let mockExpiredBudget: Record<string, jest.Mock>;

  beforeEach(() => {
    mockBudget = {
      id: 'budget-1',
      userId: 'user-1',
      categoryId: 'cat-1',
      status: BudgetStatus.ACTIVE,
      amount: Money.of('500', 'USD'),
      executedAmount: Money.zero('USD'),
      endDate: new Date('2030-01-01'), // Future date
      expire: jest.fn(),
      getDomainEvents: jest.fn().mockReturnValue([]),
      clearDomainEvents: jest.fn(),
      remainingAmount: jest.fn().mockReturnValue(Money.of('500', 'USD')),
      availableAmount: jest.fn().mockReturnValue(Money.of('500', 'USD')),
      executionPercentage: jest.fn().mockReturnValue(0),
      isOverBudget: jest.fn().mockReturnValue(false),
      createdAt: new Date(),
      updatedAt: new Date(),
      period: 'MONTHLY',
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

    mockExpiredBudget = {
      id: 'budget-2',
      userId: 'user-1',
      categoryId: 'cat-2',
      status: BudgetStatus.ACTIVE,
      amount: Money.of('300', 'USD'),
      executedAmount: Money.zero('USD'),
      endDate: new Date('2000-01-01'), // Past date
      expire: jest.fn(),
      getDomainEvents: jest.fn().mockReturnValue([{ type: 'BudgetExpired' }]),
      clearDomainEvents: jest.fn(),
      remainingAmount: jest.fn().mockReturnValue(Money.of('300', 'USD')),
      availableAmount: jest.fn().mockReturnValue(Money.of('300', 'USD')),
      executionPercentage: jest.fn().mockReturnValue(0),
      isOverBudget: jest.fn().mockReturnValue(false),
      createdAt: new Date(),
      updatedAt: new Date(),
      period: 'MONTHLY',
      startDate: new Date('2000-01-01'),
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

    useCase = new GetBudgetByIdUseCase(mockBudgetRepo, mockUoW, mockEventEmitter);
  });

  it('should throw NotFoundException if budget does not exist', async () => {
    mockBudgetRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should return budget and NOT expire if end date is in the future', async () => {
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    const result = await useCase.execute('user-1', 'budget-1');
    
    expect(result).toBeDefined();
    expect(mockBudget.expire).not.toHaveBeenCalled();
    expect(mockBudgetRepo.save).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should return budget and expire if end date is in the past', async () => {
    mockBudgetRepo.findById.mockResolvedValue(mockExpiredBudget);
    
    const result = await useCase.execute('user-1', 'budget-2');
    
    expect(result).toBeDefined();
    expect(mockExpiredBudget.expire).toHaveBeenCalled();
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockExpiredBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetExpired', { type: 'BudgetExpired' });
    expect(mockExpiredBudget.clearDomainEvents).toHaveBeenCalled();
  });
});
