import { CreateBudgetUseCase } from './create-budget.use-case';
import { BudgetPeriod } from '../../domain/budget.entity';

import { BudgetAlreadyExistsException } from '../../domain/exceptions/budget.exceptions';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

describe('CreateBudgetUseCase', () => {
  let useCase: CreateBudgetUseCase;
  let mockBudgetRepo: any;
  let mockCategoryRepo: any;
  let mockUoW: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockBudgetRepo = {
      existsActiveBudget: jest.fn(),
      save: jest.fn(),
    };
    mockCategoryRepo = {
      findById: jest.fn(),
    };
    mockUoW = {
      execute: jest.fn((cb) => cb()),
    };
    mockEventEmitter = {
      emit: jest.fn(),
    };

    useCase = new CreateBudgetUseCase(
      mockBudgetRepo, 
      mockCategoryRepo, 
      mockUoW,
      mockEventEmitter
    );
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', {
      category_id: 'cat-1',
      period: BudgetPeriod.MONTHLY,
      amount: '500',
      currency: 'USD',
      start_date: '2026-07-01'
    })).rejects.toThrow(NotFoundException);
  });

  it('should throw UnprocessableEntityException if category is INCOME', async () => {
    mockCategoryRepo.findById.mockResolvedValue({ type: 'INCOME' });
    await expect(useCase.execute('user-1', {
      category_id: 'cat-1',
      period: BudgetPeriod.MONTHLY,
      amount: '500',
      currency: 'USD',
      start_date: '2026-07-01'
    })).rejects.toThrow(UnprocessableEntityException);
  });

  it('should throw BudgetAlreadyExistsException if active budget exists', async () => {
    mockCategoryRepo.findById.mockResolvedValue({ type: 'EXPENSE' });
    mockBudgetRepo.existsActiveBudget.mockResolvedValue(true);
    await expect(useCase.execute('user-1', {
      category_id: 'cat-1',
      period: BudgetPeriod.MONTHLY,
      amount: '500',
      currency: 'USD',
      start_date: '2026-07-01'
    })).rejects.toThrow(BudgetAlreadyExistsException);
  });

  it('should create budget successfully', async () => {
    mockCategoryRepo.findById.mockResolvedValue({ type: 'EXPENSE' });
    mockBudgetRepo.existsActiveBudget.mockResolvedValue(false);

    const result = await useCase.execute('user-1', {
      category_id: 'cat-1',
      period: BudgetPeriod.MONTHLY,
      amount: '500',
      currency: 'USD',
      start_date: '2026-07-01'
    });

    expect(result).toBeDefined();
    expect(result.amount.value).toBe('500');
    expect(mockBudgetRepo.save).toHaveBeenCalled();
  });
});
