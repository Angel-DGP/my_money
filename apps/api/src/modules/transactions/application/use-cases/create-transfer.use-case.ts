import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Money, IUnitOfWork, UNIT_OF_WORK, BalanceDelta } from '@mymoney/shared';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { Transaction } from '../../domain/transaction.entity';
import { CreateTransferDto } from '../../presentation/dtos/create-transfer.dto';
import { TransactionDto } from '../../presentation/dtos/transaction.dto';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';
import { TransactionType } from '../../domain/transaction-type.enum';

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

  async execute(userId: string, dto: CreateTransferDto): Promise<{ data: TransactionDto[] }> {
    if (dto.from_account_id === dto.to_account_id) {
      throw new BadRequestException('Source and destination accounts must be different');
    }

    const fromAccount = await this.accountRepository.findById(dto.from_account_id, userId);
    if (!fromAccount) throw new NotFoundException('Source account not found');

    const toAccount = await this.accountRepository.findById(dto.to_account_id, userId);
    if (!toAccount) throw new NotFoundException('Destination account not found');

    if (fromAccount.currency !== toAccount.currency) {
      throw new BadRequestException('Accounts must have the same currency for transfer');
    }

    const amount = Money.of(dto.amount, fromAccount.currency);
    const date = new Date(dto.date);
    const transferPairId = randomUUID();

    const fromTransaction = Transaction.create({
      userId,
      accountId: dto.from_account_id,
      categoryId: null,
      type: TransactionType.EXPENSE,
      amount,
      description: dto.description ?? 'Transferencia enviada',
      date,
      transferPairId,
      isRecurring: false,
      isThirdParty: false,
      thirdPartyOwner: null,
      thirdPartyNote: null,
      paymentMethod: null,
      cardId: null,
      subscriptionId: null,
      productId: null,
    });

    const toTransaction = Transaction.create({
      userId,
      accountId: dto.to_account_id,
      categoryId: null,
      type: TransactionType.INCOME,
      amount,
      description: dto.description ?? 'Transferencia recibida',
      date,
      transferPairId,
      isRecurring: false,
      isThirdParty: false,
      thirdPartyOwner: null,
      thirdPartyNote: null,
      paymentMethod: null,
      cardId: null,
      subscriptionId: null,
      productId: null,
    });

    const fromDelta = BalanceDelta.decrease(amount);
    const toDelta = BalanceDelta.increase(amount);

    const fromBalanceChangeEvent = fromAccount.applyBalanceDelta(fromDelta, 'TRANSFER_OUT');
    const toBalanceChangeEvent = toAccount.applyBalanceDelta(toDelta, 'TRANSFER_IN');

    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(fromTransaction);
      await this.transactionRepository.save(toTransaction);
      await this.accountRepository.save(fromAccount);
      await this.accountRepository.save(toAccount);
    });

    fromTransaction.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    toTransaction.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    this.eventEmitter.emit(fromBalanceChangeEvent.type, fromBalanceChangeEvent);
    this.eventEmitter.emit(toBalanceChangeEvent.type, toBalanceChangeEvent);

    fromTransaction.clearDomainEvents();
    toTransaction.clearDomainEvents();

    return {
      data: [TransactionDto.fromDomain(fromTransaction), TransactionDto.fromDomain(toTransaction)]
    };
  }
}
