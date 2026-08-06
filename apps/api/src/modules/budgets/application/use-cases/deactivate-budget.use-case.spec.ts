import { DeactivateBudgetUseCase } from './deactivate-budget.use-case';
import { BudgetNotActiveException } from '../../domain/exceptions/budget.exceptions';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { BudgetStatus } from '../../domain/budget.entity';

describe('DeactivateBudgetUseCase', () => {
  let useCase: DeactivateBudgetUseCase;
  let mockBudgetRepo: any;
  let mockUoW: any;
  let mockEventEmitter: any;
  let mockBudget: any;

  beforeEach(() => {
    mockBudget = {
      id: 'budget-1',
      userId: 'user-1',
      status: BudgetStatus.ACTIVE,
      deactivate: jest.fn(),
      getDomainEvents: jest.fn().mockReturnValue([{ type: 'BudgetDeactivated' }]),
      clearDomainEvents: jest.fn(),
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

    useCase = new DeactivateBudgetUseCase(mockBudgetRepo, mockUoW, mockEventEmitter);
  });

  it('should throw NotFoundException if budget does not exist', async () => {
    mockBudgetRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw UnprocessableEntityException if budget is not active', async () => {
    mockBudget.deactivate.mockImplementation(() => {
      throw new BudgetNotActiveException();
    });
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    await expect(useCase.execute('user-1', 'budget-1')).rejects.toThrow(UnprocessableEntityException);
  });

  it('should deactivate budget and emit domain events', async () => {
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    await useCase.execute('user-1', 'budget-1');
    
    expect(mockBudget.deactivate).toHaveBeenCalledWith('USER_REQUEST');
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetDeactivated', { type: 'BudgetDeactivated' });
    expect(mockBudget.clearDomainEvents).toHaveBeenCalled();
  });
});
