import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {  BudgetStatus } from '../../domain/budget.entity';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { BudgetDto } from '../../presentation/dtos/budget.dto';

@Injectable()
export class GetBudgetByIdUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, budgetId: string): Promise<BudgetDto> {
    const budget = await this.budgetRepository.findById(budgetId, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (budget.status === BudgetStatus.ACTIVE && budget.endDate.getTime() < today.getTime()) {
      await this.unitOfWork.execute(async () => {
        budget.expire();
        await this.budgetRepository.save(budget);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budget.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
      budget.clearDomainEvents();
    }

    return BudgetDto.fromDomain(budget);
  }
}
