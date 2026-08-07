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

    // Load account only if amount changes
    let account = null;
    let balanceChangeEvent = null;

    if (dto.amount) {
      account = await this.accountRepository.findById(transaction.accountId, userId);
      if (!account) throw new NotFoundException('Account not found');

      const newAmount = Money.of(dto.amount, account.currency);
      const previousAmount = transaction.amount;
      
      if (!newAmount.value.eq(previousAmount.value)) {
        // Delta = New - Old. 
        // But wait! If it's an EXPENSE, an increase in amount means we subtract MORE from the account.
        // If it's an INCOME, an increase in amount means we add MORE to the account.
        
        let delta: BalanceDelta;
        
        if (transaction.type === 'INCOME') {
          // If previous was 100, new is 150. Delta = +50.
          // If previous was 150, new is 100. Delta = -50.
          const diff = newAmount.subtract(previousAmount);
          delta = diff.value.gte(0) ? BalanceDelta.increase(diff) : BalanceDelta.decrease(Money.of(diff.value.abs(), diff.currency));
        } else if (transaction.type === 'EXPENSE') {
          // If previous was 100 (account -100), new is 150 (account -150). We need to subtract 50.
          // If previous was 150 (account -150), new is 100 (account -100). We need to add 50.
          const diff = newAmount.subtract(previousAmount);
          delta = diff.value.gte(0) ? BalanceDelta.decrease(diff) : BalanceDelta.increase(Money.of(diff.value.abs(), diff.currency));
        } else {
          // It's a transfer, which cannot be edited individually. But transaction.updateAmount validates that.
          throw new CannotEditTransactionTypeException(); 
        }

        balanceChangeEvent = account.applyBalanceDelta(delta, 'TRANSACTION_UPDATED');
        transaction.updateAmount(newAmount, userId);
      }
    }

    if (dto.date) {
      transaction.updateDate(new Date(dto.date), userId);
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

    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(transaction);
      if (account) {
        await this.accountRepository.save(account);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
    if (balanceChangeEvent) {
      this.eventEmitter.emit(balanceChangeEvent.constructor.name, balanceChangeEvent);
    }
    transaction.clearDomainEvents();

    return TransactionDto.fromDomain(transaction);
  }
}
