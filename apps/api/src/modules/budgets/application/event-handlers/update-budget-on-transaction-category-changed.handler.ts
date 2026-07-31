import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionCategoryChangedEvent, IUnitOfWork, UNIT_OF_WORK, BalanceDelta, Money, Currency } from '@mymoney/shared';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateBudgetOnTransactionCategoryChangedHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('TransactionCategoryChanged')
  async handle(event: TransactionCategoryChangedEvent) {
    if (event.transactionType !== 'EXPENSE') return;

    const date = new Date(event.date);
    const amount = Money.of(event.amount.value, event.amount.currency as Currency);

    const budgetPreviousCat = event.previousCategoryId 
      ? await this.budgetRepository.findActiveByCategoryAndDate(event.previousCategoryId, event.userId, date)
      : null;

    const budgetNewCat = event.newCategoryId 
      ? await this.budgetRepository.findActiveByCategoryAndDate(event.newCategoryId, event.userId, date)
      : null;

    await this.unitOfWork.execute(async () => {
      if (budgetPreviousCat) {
        budgetPreviousCat.applyTransactionDelta(BalanceDelta.decrease(amount), date);
        await this.budgetRepository.save(budgetPreviousCat);
      }

      if (budgetNewCat) {
        budgetNewCat.applyTransactionDelta(BalanceDelta.increase(amount), date);
        await this.budgetRepository.save(budgetNewCat);
      }
    });

    // Emit budget events outside transaction
    if (budgetPreviousCat) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budgetPreviousCat.getDomainEvents().forEach((evt: any) => this.eventEmitter.emit(evt.type, evt));
      budgetPreviousCat.clearDomainEvents();
    }
    
    if (budgetNewCat) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budgetNewCat.getDomainEvents().forEach((evt: any) => this.eventEmitter.emit(evt.type, evt));
      budgetNewCat.clearDomainEvents();
    }
  }
}
