import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUnitOfWork, UNIT_OF_WORK, BalanceDelta } from '@mymoney/shared';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';
import { Account } from '../../../accounts/domain/account.entity';


@Injectable()
export class DeleteTransferUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(pairId: string, userId: string): Promise<void> {
    const transactions = await this.transactionRepository.findByTransferPairId(pairId, userId);
    
    if (transactions.length === 0) {
      throw new NotFoundException('Transfer pair not found');
    }

    // Filter out already deleted transactions
    const activeTransactions = transactions.filter(t => !t.isDeleted);
    if (activeTransactions.length === 0) {
      return;
    }

    // Load unique accounts
    const accountIds = [...new Set(activeTransactions.map(t => t.accountId))];
    const accountsMap = new Map<string, Account>();
    
    for (const accId of accountIds) {
      const account = await this.accountRepository.findById(accId, userId);
      if (!account) {
        throw new NotFoundException(`Account ${accId} not found`);
      }
      accountsMap.set(accId, account);
    }

    const balanceEvents = [];

    for (const transaction of activeTransactions) {
      const account = accountsMap.get(transaction.accountId)!;
      
      transaction.softDeleteAsTransfer(userId);
      
      let delta: BalanceDelta;
      if (transaction.type === 'INCOME') {
        delta = BalanceDelta.decrease(transaction.amount);
      } else {
        delta = BalanceDelta.increase(transaction.amount);
      }

      const balanceChangeEvent = account.applyBalanceDelta(delta, 'TRANSACTION_DELETED');
      balanceEvents.push(balanceChangeEvent);
    }

    await this.unitOfWork.execute(async () => {
      for (const t of activeTransactions) {
        await this.transactionRepository.save(t);
      }
      for (const acc of Array.from(accountsMap.values())) {
        await this.accountRepository.save(acc);
      }
    });

    for (const t of activeTransactions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      t.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
      t.clearDomainEvents();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    balanceEvents.forEach((event: any) => this.eventEmitter.emit(event.type, event));
  }
}
