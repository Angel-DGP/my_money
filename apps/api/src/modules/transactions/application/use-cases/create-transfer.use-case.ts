import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Money, IUnitOfWork, UNIT_OF_WORK, BalanceDelta } from '@mymoney/shared';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionType } from '../../domain/transaction-type.enum';
import { CreateTransferDto } from '../../presentation/dtos/create-transaction.dto';
import { TransferPairDto, TransactionDto } from '../../presentation/dtos/transaction.dto';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';
import { TransferRequiresDifferentAccountsException } from '../../domain/exceptions/transaction.exceptions';


@Injectable()
export class CreateTransferUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, dto: CreateTransferDto): Promise<TransferPairDto> {
    if (dto.source_account_id === dto.destination_account_id) {
      throw new TransferRequiresDifferentAccountsException();
    }

    const sourceAccount = await this.accountRepository.findById(dto.source_account_id, userId);
    if (!sourceAccount) {
      throw new NotFoundException('Source account not found');
    }

    const destinationAccount = await this.accountRepository.findById(dto.destination_account_id, userId);
    if (!destinationAccount) {
      throw new NotFoundException('Destination account not found');
    }

    const sourceAmount = Money.of(dto.amount, sourceAccount.currency);
    const destinationAmount = Money.of(dto.destination_amount, destinationAccount.currency);
    const date = new Date(dto.date);
    const transferPairId = randomUUID();

    const sourceTransaction = Transaction.create({
      userId,
      accountId: dto.source_account_id,
      categoryId: null, // Transfers don't have categories by default
      type: TransactionType.EXPENSE,
      amount: sourceAmount,
      description: dto.description ?? 'Transferencia saliente',
      date,
      transferPairId,
      isRecurring: false,
    });

    const destinationTransaction = Transaction.create({
      userId,
      accountId: dto.destination_account_id,
      categoryId: null,
      type: TransactionType.INCOME,
      amount: destinationAmount,
      description: dto.description ?? 'Transferencia entrante',
      date,
      transferPairId,
      isRecurring: false,
    });

    // Update balances
    const sourceDelta = BalanceDelta.decrease(sourceAmount);
    const sourceBalanceEvent = sourceAccount.applyBalanceDelta(sourceDelta, 'TRANSACTION_CREATED');

    const destinationDelta = BalanceDelta.increase(destinationAmount);
    const destinationBalanceEvent = destinationAccount.applyBalanceDelta(destinationDelta, 'TRANSACTION_CREATED');

    // Save everything atomically
    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(sourceTransaction);
      await this.transactionRepository.save(destinationTransaction);
      await this.accountRepository.save(sourceAccount);
      await this.accountRepository.save(destinationAccount);
    });

    // Emit all events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceTransaction.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    destinationTransaction.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    this.eventEmitter.emit(sourceBalanceEvent.type, sourceBalanceEvent);
    this.eventEmitter.emit(destinationBalanceEvent.type, destinationBalanceEvent);
    
    sourceTransaction.clearDomainEvents();
    destinationTransaction.clearDomainEvents();

    return {
      transfer_pair_id: transferPairId,
      source_transaction: TransactionDto.fromDomain(sourceTransaction),
      destination_transaction: TransactionDto.fromDomain(destinationTransaction),
    };
  }
}
