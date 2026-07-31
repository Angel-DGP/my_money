import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionAmountChangedEvent, IUnitOfWork, UNIT_OF_WORK, BalanceDelta, Money, Currency } from '@mymoney/shared';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateBudgetOnTransactionAmountChangedHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('TransactionAmountChanged')
  async handle(event: TransactionAmountChangedEvent) {
    if (event.transactionType !== 'EXPENSE') return;
    if (!event.categoryId) return;

    const date = new Date(event.date);
    const previousAmount = Money.of(event.previousAmount.value, event.previousAmount.currency as Currency);
    const newAmount = Money.of(event.newAmount.value, event.newAmount.currency as Currency);

    const budget = await this.budgetRepository.findActiveByCategoryAndDate(
      event.categoryId,
      event.userId,
      date
    );

    if (!budget) return;

    // Delta between new and old
    const difference = newAmount.subtract(previousAmount);
    
    if (difference.value.gt(0)) {
      budget.applyTransactionDelta(BalanceDelta.increase(difference), date);
    } else if (difference.value.lt(0)) {
      // difference is negative, so invert it for decrease
      budget.applyTransactionDelta(BalanceDelta.decrease(Money.of(difference.value.abs(), difference.currency)), date);
    }

    await this.unitOfWork.execute(async () => {
      await this.budgetRepository.save(budget);
    });

    // Emit budget events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    budget.getDomainEvents().forEach((evt: any) => this.eventEmitter.emit(evt.type, evt));
    budget.clearDomainEvents();
  }
}
