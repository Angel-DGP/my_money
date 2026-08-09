import { Goal } from './goal.entity';
import { GoalStatus } from './goal-status.enum';
import { GoalException } from './exceptions/goal.exceptions';
import { Money, Currency } from '@mymoney/shared';
import { GoalCompletedEvent } from './events/goal-completed.event';
import { GoalProgressUpdatedEvent } from './events/goal-progress-updated.event';

describe('Goal Entity', () => {
  const userId = 'user-123';
  const name = 'Viaje a Japón';

  const createMoney = (amount: number, currency: Currency = Currency.USD) => {
    return Money.of(amount, currency);
  };

  describe('create', () => {
    it('should create a new goal with ACTIVE status and 0 currentAmount', () => {
      const targetAmount = createMoney(1000);
      const goal = Goal.create({ userId, name, targetAmount });

      expect(goal.id).toBeDefined();
      expect(goal.userId).toBe(userId);
      expect(goal.name).toBe(name);
      expect(goal.targetAmount.value.toNumber()).toBe(1000);
      expect(goal.currentAmount.value.toNumber()).toBe(0);
      expect(goal.status).toBe(GoalStatus.ACTIVE);
      expect(goal.targetDate).toBeNull();
    });

    it('should throw an exception if targetAmount is <= 0', () => {
      expect(() => {
        Goal.create({
          userId,
          name,
          targetAmount: createMoney(0),
        });
      }).toThrow(GoalException);

      expect(() => {
        Goal.create({
          userId,
          name,
          targetAmount: createMoney(-100),
        });
      }).toThrow(GoalException);
    });

    it('should throw an exception if targetDate is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      expect(() => {
        Goal.create({
          userId,
          name,
          targetAmount: createMoney(1000),
          targetDate: pastDate,
        });
      }).toThrow(GoalException);
    });

    it('should allow targetDate today or in the future', () => {
      const today = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 10);

      const goalToday = Goal.create({ userId, name, targetAmount: createMoney(1000), targetDate: today });
      const goalFuture = Goal.create({ userId, name, targetAmount: createMoney(1000), targetDate: future });

      expect(goalToday.targetDate).toEqual(today);
      expect(goalFuture.targetDate).toEqual(future);
    });
  });

  describe('addProgress', () => {
    let goal: Goal;

    beforeEach(() => {
      goal = Goal.create({
        userId,
        name,
        targetAmount: createMoney(1000),
      });
      goal.clearDomainEvents(); // Clear creation events if any
    });

    it('should add progress and emit GoalProgressUpdatedEvent if target is not reached', () => {
      goal.addProgress(createMoney(300), userId);

      expect(goal.currentAmount.value.toNumber()).toBe(300);
      expect(goal.status).toBe(GoalStatus.ACTIVE);
      expect(goal.progressPercentage()).toBe(30);

      const events = goal.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(GoalProgressUpdatedEvent);
      expect((events[0] as GoalProgressUpdatedEvent).newCurrentAmount.value.toNumber()).toBe(300);
    });

    it('should complete the goal if exact target is reached', () => {
      // 900 current + 100 added -> should be 1000
      goal.addProgress(createMoney(900), userId);
      goal.clearDomainEvents();

      goal.addProgress(createMoney(100), userId);

      expect(goal.currentAmount.value.toNumber()).toBe(1000);
      expect(goal.status).toBe(GoalStatus.COMPLETED);
      expect(goal.progressPercentage()).toBe(100);

      const events = goal.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(GoalCompletedEvent);
    });

    it('should cap the amount to targetAmount and transition to COMPLETED if it exceeds target', () => {
      // 950 current + 300 added -> should be 1000
      goal.addProgress(createMoney(950), userId);
      goal.clearDomainEvents();

      goal.addProgress(createMoney(300), userId);

      expect(goal.currentAmount.value.toNumber()).toBe(1000);
      expect(goal.status).toBe(GoalStatus.COMPLETED);
      expect(goal.progressPercentage()).toBe(100);

      const events = goal.getDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(GoalCompletedEvent);
    });

    it('should throw an exception if trying to add progress to a COMPLETED goal', () => {
      goal.addProgress(createMoney(1000), userId); // Reaches 1000, becomes COMPLETED
      expect(goal.status).toBe(GoalStatus.COMPLETED);

      expect(() => {
        goal.addProgress(createMoney(50), userId);
      }).toThrow(GoalException);
    });

    it('should throw an exception if trying to add progress to a PAUSED goal', () => {
      // Usar reconstitute para forzar el estado a PAUSED ya que el MVP no tiene pause()
      const pausedGoal = Goal.reconstitute({
        id: '123',
        userId,
        name,
        targetAmount: createMoney(1000),
        currentAmount: createMoney(500),
        status: GoalStatus.PAUSED,
        targetDate: null,
        description: "",
        priority: 3,
        color: "#000",
        icon: "target",
        accountId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        pausedGoal.addProgress(createMoney(100), userId);
      }).toThrow(GoalException);
    });

    it('should ignore negative or zero amounts', () => {
      goal.addProgress(createMoney(0), userId);
      goal.addProgress(createMoney(-50), userId);

      expect(goal.currentAmount.value.toNumber()).toBe(0);
      expect(goal.getDomainEvents().length).toBe(0);
    });
  });
});
