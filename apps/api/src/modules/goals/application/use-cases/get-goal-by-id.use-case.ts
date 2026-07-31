import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';
import { GoalDto } from '../../presentation/dtos/goal.dto';

@Injectable()
export class GetGoalByIdUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
  ) {}

  async execute(userId: string, id: string): Promise<GoalDto> {
    const goal = await this.goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return GoalDto.fromDomain(goal);
  }
}
