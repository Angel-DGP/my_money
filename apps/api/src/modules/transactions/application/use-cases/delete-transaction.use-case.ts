import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUnitOfWork, UNIT_OF_WORK, BalanceDelta } from '@mymoney/shared';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';


@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.isDeleted) {
      return;
    }

    const account = await this.accountRepository.findById(transaction.accountId, userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Soft delete transaction
    transaction.softDelete(userId);

    // Revert balance effect
    let delta: BalanceDelta;
    if (transaction.type === 'INCOME') {
      delta = BalanceDelta.decrease(transaction.amount);
    } else if (transaction.type === 'EXPENSE') {
      delta = BalanceDelta.increase(transaction.amount);
    } else {
      // Transfer shouldn't reach here (validated in entity softDelete method)
      delta = BalanceDelta.increase(transaction.amount); // fallback to satisfy TS, though it throws before
    }

    const balanceChangeEvent = account.applyBalanceDelta(delta, 'TRANSACTION_DELETED');

    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(transaction);
      await this.accountRepository.save(account);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    this.eventEmitter.emit(balanceChangeEvent.type, balanceChangeEvent);
    transaction.clearDomainEvents();
  }
}
