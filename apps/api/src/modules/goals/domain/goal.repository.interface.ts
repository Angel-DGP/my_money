import { Goal } from './goal.entity';

export const GOAL_REPOSITORY = Symbol('GOAL_REPOSITORY');

export interface IGoalRepository {
  findById(id: string): Promise<Goal | null>;
  findAllByUser(userId: string): Promise<Goal[]>;
  findActiveByUser(userId: string): Promise<Goal[]>;
  save(goal: Goal): Promise<void>;
}
