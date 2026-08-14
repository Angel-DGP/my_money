import { DomainEvent, BalanceDelta } from '@mymoney/shared';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, Currency, IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../../transactions/domain/transaction.repository.interface';
import { Transaction } from '../../../transactions/domain/transaction.entity';
import { TransactionType } from '../../../transactions/domain/transaction-type.enum';
import { AddGoalProgressDto } from '../../presentation/dtos/add-goal-progress.dto';
import { GoalDto } from '../../presentation/dtos/goal.dto';

@Injectable()
export class AddGoalProgressUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, id: string, dto: AddGoalProgressDto): Promise<GoalDto> {
    const goal = await this.goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    const account = await this.accountRepository.findById(dto.accountId, userId);
    if (!account) {
      throw new NotFoundException('Cuenta de origen no encontrada');
    }

    const amountToAdd = Money.of(dto.amount, dto.currency as Currency);

    // Validar saldo suficiente en la cuenta de origen
    if (account.currentBalance.value.lt(amountToAdd.value)) {
      throw new BadRequestException(
        `Saldo insuficiente en ${account.name}. Saldo disponible: ${account.currentBalance.value.toFixed(2)} ${account.currency}`
      );
    }

    // Agregar progreso a la meta
    goal.addProgress(amountToAdd, userId);

    // Debitar saldo de la cuenta de origen
    const delta = BalanceDelta.decrease(amountToAdd);
    const balanceChangeEvent = account.applyBalanceDelta(delta, 'TRANSACTION_CREATED');

    // Registrar la transacción de débito por ahorro
    const transaction = Transaction.create({
      userId,
      accountId: account.id,
      categoryId: null,
      type: TransactionType.EXPENSE,
      amount: amountToAdd,
      description: `Aporte a meta: ${goal.name}`,
      date: new Date(),
      transferPairId: null,
      isRecurring: false,
      isThirdParty: false,
      thirdPartyOwner: null,
      thirdPartyNote: null,
      paymentMethod: 'TRANSFER',
      cardId: null,
      subscriptionId: null,
      productId: null,
      installment: null,
    });

    await this.unitOfWork.execute(async () => {
      await this.goalRepository.save(goal);
      await this.accountRepository.save(account);
      await this.transactionRepository.save(transaction);
    });

    // Enviar eventos de dominio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goal.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
    transaction.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
    this.eventEmitter.emit(balanceChangeEvent.constructor.name, balanceChangeEvent);

    goal.clearDomainEvents();
    transaction.clearDomainEvents();

    return GoalDto.fromDomain(goal);
  }
}
