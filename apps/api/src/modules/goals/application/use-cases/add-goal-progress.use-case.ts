import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, Currency, IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';
import { AddGoalProgressDto } from '../../presentation/dtos/add-goal-progress.dto';
import { GoalDto } from '../../presentation/dtos/goal.dto';

@Injectable()
export class AddGoalProgressUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, id: string, dto: AddGoalProgressDto): Promise<GoalDto> {
    const goal = await this.goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    const amountToAdd = Money.of(dto.amount, dto.currency as Currency);

    goal.addProgress(amountToAdd, userId);

    await this.unitOfWork.execute(async () => {
      await this.goalRepository.save(goal);
    });

    // Enviar eventos de dominio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goal.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    goal.clearDomainEvents();

    return GoalDto.fromDomain(goal);
  }
}
