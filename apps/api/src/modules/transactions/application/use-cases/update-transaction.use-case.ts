import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, IUnitOfWork, UNIT_OF_WORK, BalanceDelta } from '@mymoney/shared';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { UpdateTransactionDto } from '../../presentation/dtos/create-transaction.dto';
import { TransactionDto } from '../../presentation/dtos/transaction.dto';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../../accounts/domain/interfaces/account.repository.interface';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../../categories/domain/category.repository.interface';

import { IncompatibleCategoryException, CannotEditTransactionTypeException } from '../../domain/exceptions/transaction.exceptions';

import { parseTransactionDate } from '../../../../common/utils/date.util';

@Injectable()
export class UpdateTransactionUseCase {
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

  async execute(id: string, userId: string, dto: UpdateTransactionDto): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Handle account and amount changes
    let oldAccount = null;
    let newAccount = null;
    let singleAccount = null;
    let oldBalanceEvent = null;
    let newBalanceEvent = null;
    let singleBalanceEvent = null;

    const isAccountChanging = dto.account_id && dto.account_id !== transaction.accountId;

    if (isAccountChanging) {
      oldAccount = await this.accountRepository.findById(transaction.accountId, userId);
      if (!oldAccount) throw new NotFoundException('Current account not found');

      newAccount = await this.accountRepository.findById(dto.account_id!, userId);
      if (!newAccount) throw new NotFoundException('Target account not found');

      const rawAmount = dto.amount !== undefined ? dto.amount : transaction.amount.value.toString();
      const newAmount = Money.of(rawAmount, newAccount.currency);

      if (transaction.type === 'INCOME') {
        const revertDelta = BalanceDelta.decrease(transaction.amount);
        oldBalanceEvent = oldAccount.applyBalanceDelta(revertDelta, 'TRANSACTION_UPDATED');

        const applyDelta = BalanceDelta.increase(newAmount);
        newBalanceEvent = newAccount.applyBalanceDelta(applyDelta, 'TRANSACTION_UPDATED');
      } else if (transaction.type === 'EXPENSE') {
        const revertDelta = BalanceDelta.increase(transaction.amount);
        oldBalanceEvent = oldAccount.applyBalanceDelta(revertDelta, 'TRANSACTION_UPDATED');

        const applyDelta = BalanceDelta.decrease(newAmount);
        newBalanceEvent = newAccount.applyBalanceDelta(applyDelta, 'TRANSACTION_UPDATED');
      } else {
        throw new CannotEditTransactionTypeException();
      }

      transaction.updateAccount(dto.account_id!, userId);
      transaction.updateAmount(newAmount, userId);
    } else if (dto.amount) {
      singleAccount = await this.accountRepository.findById(transaction.accountId, userId);
      if (!singleAccount) throw new NotFoundException('Account not found');

      const newAmount = Money.of(dto.amount, singleAccount.currency);
      const previousAmount = transaction.amount;
      
      if (!newAmount.value.eq(previousAmount.value)) {
        let delta: BalanceDelta;
        
        if (transaction.type === 'INCOME') {
          const diff = newAmount.subtract(previousAmount);
          delta = diff.value.gte(0) ? BalanceDelta.increase(diff) : BalanceDelta.decrease(Money.of(diff.value.abs(), diff.currency));
        } else if (transaction.type === 'EXPENSE') {
          const diff = newAmount.subtract(previousAmount);
          delta = diff.value.gte(0) ? BalanceDelta.decrease(diff) : BalanceDelta.increase(Money.of(diff.value.abs(), diff.currency));
        } else {
          throw new CannotEditTransactionTypeException(); 
        }

        singleBalanceEvent = singleAccount.applyBalanceDelta(delta, 'TRANSACTION_UPDATED');
        transaction.updateAmount(newAmount, userId);
      }
    }

    if (dto.date) {
      transaction.updateDate(parseTransactionDate(dto.date), userId);
    }

    if (dto.category_id !== undefined) {
      if (dto.category_id !== null) {
        const category = await this.categoryRepository.findById(dto.category_id, userId);
        if (!category) throw new NotFoundException('Category not found');
        if (!category.isCompatibleWith(transaction.type)) {
          throw new IncompatibleCategoryException(transaction.type, category.type);
        }
      }
      transaction.updateCategory(dto.category_id, userId);
    }

    if (dto.description !== undefined) {
      transaction.updateDescription(dto.description, userId);
    }

    if (dto.is_third_party !== undefined || dto.third_party_owner !== undefined || dto.third_party_note !== undefined) {
      const isThirdParty = dto.is_third_party ?? transaction.isThirdParty;
      const owner = dto.third_party_owner !== undefined ? dto.third_party_owner : transaction.thirdPartyOwner;
      const note = dto.third_party_note !== undefined ? dto.third_party_note : transaction.thirdPartyNote;
      
      transaction.updateThirdPartyStatus(isThirdParty, owner, note, userId);
    }

    if (
      dto.payment_method !== undefined ||
      dto.card_id !== undefined ||
      dto.subscription_id !== undefined ||
      dto.product_id !== undefined
    ) {
      const paymentMethod = dto.payment_method !== undefined ? dto.payment_method : transaction.paymentMethod;
      const cardId = dto.card_id !== undefined ? dto.card_id : transaction.cardId;
      const subscriptionId = dto.subscription_id !== undefined ? dto.subscription_id : transaction.subscriptionId;
      const productId = dto.product_id !== undefined ? dto.product_id : transaction.productId;

      transaction.updateMetadata(paymentMethod ?? null, cardId ?? null, subscriptionId ?? null, productId ?? null, userId);
    }

    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(transaction);
      if (oldAccount) await this.accountRepository.save(oldAccount);
      if (newAccount) await this.accountRepository.save(newAccount);
      if (singleAccount) await this.accountRepository.save(singleAccount);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
    if (oldBalanceEvent) this.eventEmitter.emit(oldBalanceEvent.constructor.name, oldBalanceEvent);
    if (newBalanceEvent) this.eventEmitter.emit(newBalanceEvent.constructor.name, newBalanceEvent);
    if (singleBalanceEvent) this.eventEmitter.emit(singleBalanceEvent.constructor.name, singleBalanceEvent);
    transaction.clearDomainEvents();

    return TransactionDto.fromDomain(transaction);
  }
}
