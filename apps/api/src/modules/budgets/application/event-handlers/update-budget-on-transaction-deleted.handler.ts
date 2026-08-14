import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionDeletedEvent, IUnitOfWork, UNIT_OF_WORK, BalanceDelta, Money, Currency } from '@mymoney/shared';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateBudgetOnTransactionDeletedHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent(['TransactionDeletedEvent', 'TransactionDeleted'])
  async handle(event: TransactionDeletedEvent) {
    if (event.transactionType !== 'EXPENSE') return;
    if (!event.categoryId) return;

    const date = new Date(event.date);
    const amount = Money.of(event.amount.value, event.amount.currency as Currency);

    const budget = await this.budgetRepository.findActiveByCategoryAndDate(
      event.categoryId,
      event.userId,
      date
    );

    if (!budget) return;

    budget.applyTransactionDelta(BalanceDelta.decrease(amount), date);

    await this.unitOfWork.execute(async () => {
      await this.budgetRepository.save(budget);
    });

    // Emit budget events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    budget.getDomainEvents().forEach((evt: DomainEvent) => this.eventEmitter.emit(evt.constructor.name, evt));
    budget.clearDomainEvents();
  }
}
