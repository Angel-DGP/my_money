import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { Transaction } from '../../domain/transaction.entity';
import { CreateTransactionDto } from '../../presentation/dtos/create-transaction.dto';
import { TransactionDto } from '../../presentation/dtos/transaction.dto';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../../categories/domain/category.repository.interface';
import { IncompatibleCategoryException } from '../../domain/exceptions/transaction.exceptions';
import { BalanceDelta } from '@mymoney/shared';


@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, dto: CreateTransactionDto): Promise<TransactionDto> {
    const account = await this.accountRepository.findById(dto.account_id, userId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (dto.category_id) {
      const category = await this.categoryRepository.findById(dto.category_id, userId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Validate category compatibility
      if (!category.isCompatibleWith(dto.type)) {
        throw new IncompatibleCategoryException(dto.type, category.type);
      }
    }

    const amount = Money.of(dto.amount, account.currency);
    const date = new Date(dto.date);

    const transaction = Transaction.create({
      userId,
      accountId: dto.account_id,
      categoryId: dto.category_id ?? null,
      type: dto.type,
      amount,
      description: dto.description ?? null,
      date,
      transferPairId: null,
      isRecurring: false, // Default for MVP
      isThirdParty: dto.is_third_party ?? false,
      thirdPartyOwner: dto.third_party_owner ?? null,
      thirdPartyNote: dto.third_party_note ?? null,
      paymentMethod: dto.payment_method ?? null,
      cardId: dto.card_id ?? null,
      subscriptionId: dto.subscription_id ?? null,
      productId: dto.product_id ?? null,
      installment: dto.installment ? {
        totalInstallments: dto.installment.total_installments,
        interestRate: dto.installment.interest_rate ? Number(dto.installment.interest_rate) : null,
        graceMonths: dto.installment.grace_months ?? 0,
      } : null,
    });

    // Update account balance synchronously within the use case to ensure it participates in UoW
    const delta = dto.type === 'INCOME' 
      ? BalanceDelta.increase(amount) 
      : BalanceDelta.decrease(amount);

    const balanceChangeEvent = account.applyBalanceDelta(delta, 'TRANSACTION_CREATED');

    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(transaction);
      await this.accountRepository.save(account);
    });

    // Emit events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
    this.eventEmitter.emit(balanceChangeEvent.constructor.name, balanceChangeEvent);
    transaction.clearDomainEvents();

    return TransactionDto.fromDomain(transaction);
  }
}
