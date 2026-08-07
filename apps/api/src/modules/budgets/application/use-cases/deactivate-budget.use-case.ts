import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { BudgetNotActiveException } from '../../domain/exceptions/budget.exceptions';

@Injectable()
export class DeactivateBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, budgetId: string): Promise<void> {
    const budget = await this.budgetRepository.findById(budgetId, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    try {
      budget.deactivate('USER_REQUEST');
    } catch (error) {
      if (error instanceof BudgetNotActiveException) {
        throw new UnprocessableEntityException('El presupuesto ya no está activo.');
      }
      throw error;
    }

    await this.unitOfWork.execute(async () => {
      await this.budgetRepository.save(budget);
    });

    // Emit events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    budget.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
    budget.clearDomainEvents();
  }
}
