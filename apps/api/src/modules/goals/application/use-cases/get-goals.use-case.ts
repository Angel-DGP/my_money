import { Injectable, Inject } from '@nestjs/common';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';
import { GoalDto } from '../../presentation/dtos/goal.dto';

@Injectable()
export class GetGoalsUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
  ) {}

  async execute(userId: string, status?: string): Promise<GoalDto[]> {
    let goals;
    if (status && status.toUpperCase() === 'ACTIVE') {
      goals = await this.goalRepository.findActiveByUser(userId);
    } else {
      goals = await this.goalRepository.findAllByUser(userId);
    }

    if (status && status.toUpperCase() !== 'ACTIVE') {
      goals = goals.filter(g => g.status === status.toUpperCase());
    }

    return goals.map(goal => GoalDto.fromDomain(goal));
  }
}
