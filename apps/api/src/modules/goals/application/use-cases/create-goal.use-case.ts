import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, Currency, IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { Goal } from '../../domain/goal.entity';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';
import { CreateGoalDto } from '../../presentation/dtos/create-goal.dto';
import { GoalDto } from '../../presentation/dtos/goal.dto';

@Injectable()
export class CreateGoalUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, dto: CreateGoalDto): Promise<GoalDto> {
    const targetAmount = Money.of(dto.target_amount, dto.currency as Currency);
    const targetDate = dto.target_date ? new Date(dto.target_date) : null;

    const goal = Goal.create({
      userId,
      name: dto.name,
      targetAmount,
      targetDate,
      description: dto.description,
      priority: dto.priority,
      color: dto.color,
      icon: dto.icon,
      accountId: dto.account_id,
    });

    await this.unitOfWork.execute(async () => {
      await this.goalRepository.save(goal);
    });

    // Enviar eventos de dominio si los hubiera
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goal.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    goal.clearDomainEvents();

    return GoalDto.fromDomain(goal);
  }
}
