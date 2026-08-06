import { CreateGoalUseCase } from './create-goal.use-case';
import { AddGoalProgressUseCase } from './add-goal-progress.use-case';
import { GetGoalsUseCase } from './get-goals.use-case';
import { GetGoalByIdUseCase } from './get-goal-by-id.use-case';
import { Goal } from '../../domain/goal.entity';
import { GoalStatus } from '../../domain/goal-status.enum';
import { Money} from '@mymoney/shared';

import { NotFoundException } from '@nestjs/common';
import { GoalException } from '../../domain/exceptions/goal.exceptions';

describe('Goals Use Cases', () => {
  let mockGoalRepository: any;
  let mockUnitOfWork: any;
  let mockEventEmitter: any;
  const userId = 'user-1';

  beforeEach(() => {
    mockGoalRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAllByUser: jest.fn(),
      findActiveByUser: jest.fn(),
    };

    mockUnitOfWork = {
      execute: jest.fn((work) => work()),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };
  });

  describe('CreateGoalUseCase', () => {
    let useCase: CreateGoalUseCase;

    beforeEach(() => {
      useCase = new CreateGoalUseCase(mockGoalRepository, mockUnitOfWork, mockEventEmitter);
    });

    it('should create a goal successfully', async () => {
      const dto = {
        name: 'New Car',
        target_amount: 5000,
        currency: 'USD',
      };

      const result = await useCase.execute(userId, dto);

      expect(mockGoalRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Car');
      expect(result.target_amount.value).toBe('5000.0000');
      expect(result.status).toBe(GoalStatus.ACTIVE);
      expect(result.current_amount.value).toBe('0.0000');
    });
  });

  describe('GetGoalsUseCase', () => {
    let useCase: GetGoalsUseCase;

    beforeEach(() => {
      useCase = new GetGoalsUseCase(mockGoalRepository);
    });

    it('should return all goals when no status is provided', async () => {
      const goal = Goal.create({ userId, name: 'Goal 1', targetAmount: Money.of(100, 'USD') });
      mockGoalRepository.findAllByUser.mockResolvedValue([goal]);

      const result = await useCase.execute(userId);

      expect(mockGoalRepository.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Goal 1');
    });

    it('should return only ACTIVE goals when status is ACTIVE', async () => {
      const goal = Goal.create({ userId, name: 'Goal 2', targetAmount: Money.of(200, 'USD') });
      mockGoalRepository.findActiveByUser.mockResolvedValue([goal]);

      const result = await useCase.execute(userId, 'ACTIVE');

      expect(mockGoalRepository.findActiveByUser).toHaveBeenCalledWith(userId);
      expect(result.length).toBe(1);
    });
  });

  describe('GetGoalByIdUseCase', () => {
    let useCase: GetGoalByIdUseCase;

    beforeEach(() => {
      useCase = new GetGoalByIdUseCase(mockGoalRepository);
    });

    it('should return a goal if it belongs to the user', async () => {
      const goal = Goal.create({ userId, name: 'Goal 1', targetAmount: Money.of(100, 'USD') });
      mockGoalRepository.findById.mockResolvedValue(goal);

      const result = await useCase.execute(userId, goal.id);

      expect(result.id).toBe(goal.id);
    });

    it('should throw NotFoundException if goal does not exist', async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if goal belongs to another user', async () => {
      const goal = Goal.create({ userId: 'other-user', name: 'Goal 1', targetAmount: Money.of(100, 'USD') });
      mockGoalRepository.findById.mockResolvedValue(goal);

      await expect(useCase.execute(userId, goal.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('AddGoalProgressUseCase', () => {
    let useCase: AddGoalProgressUseCase;
    let goal: Goal;

    beforeEach(() => {
      useCase = new AddGoalProgressUseCase(mockGoalRepository, mockUnitOfWork, mockEventEmitter);
      goal = Goal.create({ userId, name: 'Goal 1', targetAmount: Money.of(1000, 'USD') });
      mockGoalRepository.findById.mockResolvedValue(goal);
    });

    it('should add progress and emit events', async () => {
      const dto = { amount: 200, currency: 'USD' };

      const result = await useCase.execute(userId, goal.id, dto);

      expect(mockGoalRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
      expect(result.current_amount.value).toBe('200.0000');
      expect(result.progress_percentage).toBe(20);
      expect(result.status).toBe(GoalStatus.ACTIVE);
    });

    it('should throw exception if goal is COMPLETED', async () => {
      await useCase.execute(userId, goal.id, { amount: 1000, currency: 'USD' });
      
      expect(goal.status).toBe(GoalStatus.COMPLETED);

      await expect(useCase.execute(userId, goal.id, { amount: 100, currency: 'USD' })).rejects.toThrow(GoalException);
    });
  });
});
