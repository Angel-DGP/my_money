import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionDateChangedEvent, IUnitOfWork, UNIT_OF_WORK, BalanceDelta, Money, Currency } from '@mymoney/shared';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpdateBudgetOnTransactionDateChangedHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @OnEvent('TransactionDateChanged')
  async handle(event: TransactionDateChangedEvent) {
    if (event.transactionType !== 'EXPENSE') return;

    const previousDate = new Date(event.previousDate);
    const newDate = new Date(event.newDate);
    const amount = Money.of(event.amount.value, event.amount.currency as Currency);

    if (!event.categoryId) {
      return;
    }

    const budgetForPreviousPeriod = await this.budgetRepository.findActiveByCategoryAndDate(
      event.categoryId,
      event.userId,
      previousDate
    );

    const budgetForNewPeriod = await this.budgetRepository.findActiveByCategoryAndDate(
      event.categoryId,
      event.userId,
      newDate
    );

    // If it's the exact same budget (didn't cross period boundary), do nothing
    if (budgetForPreviousPeriod?.id === budgetForNewPeriod?.id) {
      return;
    }

    await this.unitOfWork.execute(async () => {
      if (budgetForPreviousPeriod) {
        budgetForPreviousPeriod.applyTransactionDelta(BalanceDelta.decrease(amount), previousDate);
        await this.budgetRepository.save(budgetForPreviousPeriod);
      }

      if (budgetForNewPeriod) {
        budgetForNewPeriod.applyTransactionDelta(BalanceDelta.increase(amount), newDate);
        await this.budgetRepository.save(budgetForNewPeriod);
      }
    });

    // Emit budget events outside transaction
    if (budgetForPreviousPeriod) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budgetForPreviousPeriod.getDomainEvents().forEach((evt: DomainEvent) => this.eventEmitter.emit(evt.constructor.name, evt));
      budgetForPreviousPeriod.clearDomainEvents();
    }
    
    if (budgetForNewPeriod) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budgetForNewPeriod.getDomainEvents().forEach((evt: DomainEvent) => this.eventEmitter.emit(evt.constructor.name, evt));
      budgetForNewPeriod.clearDomainEvents();
    }
  }
}
