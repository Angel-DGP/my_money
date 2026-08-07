import { DomainEvent } from '@mymoney/shared';
import { DeactivateBudgetUseCase } from './deactivate-budget.use-case';
import { BudgetNotActiveException } from '../../domain/exceptions/budget.exceptions';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { BudgetStatus } from '../../domain/budget.entity';

describe('DeactivateBudgetUseCase', () => {
  let useCase: DeactivateBudgetUseCase;
  let mockBudgetRepo: Record<string, jest.Mock>;
  let mockUoW: Record<string, jest.Mock>;
  let mockEventEmitter: Record<string, jest.Mock>;
  let mockBudget: Record<string, jest.Mock>;

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
    ((mockBudget.deactivate as jest.Mock) as jest.Mock).mockImplementation(() => {
      throw new BudgetNotActiveException();
    });
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    await expect(useCase.execute('user-1', 'budget-1')).rejects.toThrow(UnprocessableEntityException);
  });

  it('should deactivate budget and emit domain events', async () => {
    mockBudgetRepo.findById.mockResolvedValue(mockBudget);
    
    await useCase.execute('user-1', 'budget-1');
    
    expect((mockBudget.deactivate as jest.Mock)).toHaveBeenCalledWith('USER_REQUEST');
    expect(mockBudgetRepo.save).toHaveBeenCalledWith(mockBudget);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('BudgetDeactivated', { type: 'BudgetDeactivated' });
    expect((mockBudget.clearDomainEvents as jest.Mock)).toHaveBeenCalled();
  });
});
