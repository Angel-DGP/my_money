import { GetBudgetsUseCase } from './get-budgets.use-case';
import { BudgetPeriod, BudgetStatus} from '../../domain/budget.entity';
import { Money } from '@mymoney/shared';

describe('GetBudgetsUseCase', () => {
  let useCase: GetBudgetsUseCase;
  let mockBudgetRepo: unknown;
  let mockUoW: unknown;
  let mockEventEmitter: unknown;
  let mockBudget: unknown;
  let mockExpiredBudget: unknown;

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
      period: BudgetPeriod.MONTHLY,
      startDate: new Date('2030-01-01'),
      alertThreshold: 80,
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
      period: BudgetPeriod.MONTHLY,
      startDate: new Date('2000-01-01'),
      alertThreshold: 80,
    };

    mockBudgetRepo = {
      findAllByUser: jest.fn().mockResolvedValue([mockBudget, mockExpiredBudget]),
      save: jest.fn(),
    };

    mockUoW = {
      execute: jest.fn((cb) => cb()),
    };
    
    mockEventEmitter = {
      emit: jest.fn(),
    };

    useCase = new GetBudgetsUseCase(mockBudgetRepo, mockUoW, mockEventEmitter);
  });

  it('should find and return budgets, processing lazy expiration', async () => {
    const result = await useCase.findAll('user-1');
    
    expect(result).toHaveLength(2);
    // The expired budget should be expired
    expect(mockExpiredBudget.expire).toHaveBeenCalled();
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockExpiredBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetExpired', { type: 'BudgetExpired' });
    expect(mockExpiredBudget.clearDomainEvents).toHaveBeenCalled();

    // The active budget should NOT be expired
    expect(mockBudget.expire).not.toHaveBeenCalled();
    expect(mockBudgetRepo.save).not.toHaveBeenCalledWith(mockBudget);
  });

  it('should filter budgets by status', async () => {
    mockBudgetRepo.findAllByUser.mockResolvedValue([mockBudget]);
    
    const result = await useCase.findAll('user-1', BudgetStatus.EXPIRED);
    expect(result).toHaveLength(0);

    const activeResult = await useCase.findAll('user-1', BudgetStatus.ACTIVE);
    expect(activeResult).toHaveLength(1);
  });

  it('should filter budgets by category_id', async () => {
    mockBudgetRepo.findAllByUser.mockResolvedValue([mockBudget]);
    
    const result = await useCase.findAll('user-1', undefined, 'cat-1');
    expect(result).toHaveLength(1);

    const emptyResult = await useCase.findAll('user-1', undefined, 'cat-other');
    expect(emptyResult).toHaveLength(0);
  });
});
