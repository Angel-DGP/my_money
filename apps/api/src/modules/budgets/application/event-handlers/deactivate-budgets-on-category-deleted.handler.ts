import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { CategoryDeletedEvent } from '../../../categories/domain/category.events';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DeactivateBudgetsOnCategoryDeletedHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('CategoryDeleted')
  async handle(event: CategoryDeletedEvent) {
    // Find all budgets for this category
    const budgets = await this.budgetRepository.findByCategory(event.categoryId, event.userId);
    
    const activeBudgets = budgets.filter(b => b.isActive());
    
    if (activeBudgets.length === 0) return;

    await this.unitOfWork.execute(async () => {
      for (const budget of activeBudgets) {
        budget.deactivate('CATEGORY_DELETED');
        await this.budgetRepository.save(budget);
      }
    });

    // Emits if there are any events (though deactivate currently doesn't emit domain events, just in case)
    for (const budget of activeBudgets) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budget.getDomainEvents().forEach((evt: DomainEvent) => this.eventEmitter.emit(evt.constructor.name, evt));
      budget.clearDomainEvents();
    }
  }
}
