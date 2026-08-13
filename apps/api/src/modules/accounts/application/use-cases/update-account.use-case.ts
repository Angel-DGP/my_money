import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Money, BusinessRuleViolationException } from '@mymoney/shared';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/interfaces/account.repository.interface';
import { UpdateAccountDto } from '../../presentation/dtos/update-account.dto';
import { AccountDto } from '../../presentation/dtos/account.dto';

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(id: string, userId: string, dto: UpdateAccountDto): Promise<AccountDto> {
    const account = await this.accountRepository.findById(id, userId);
    
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (dto.name && dto.name !== account.name) {
      const exists = await this.accountRepository.existsByNameAndUser(dto.name, userId);
      if (exists) {
        throw new BusinessRuleViolationException('ACCOUNT_NAME_EXISTS', 'An active account with this name already exists.');
      }
    }

    if (dto.initial_balance !== undefined) {
      const hasTransactions = await this.accountRepository.hasTransactions(id);
      
      if (hasTransactions) {
        throw new BusinessRuleViolationException(
          'ACC_004', 
          'Cannot modify initial balance after transactions have been registered.'
        );
      }
      
      const newInitialBalance = Money.of(dto.initial_balance, account.currency);
      account.updateInitialBalance(newInitialBalance, userId);
    }

    account.updateProfile(
      dto.name ?? account.name,
      dto.color !== undefined ? dto.color : account.color,
      dto.icon !== undefined ? dto.icon : account.icon,
      userId,
      dto.institution_id,
      dto.specific_type,
    );

    await this.accountRepository.save(account);

    return AccountDto.fromDomain(account);
  }
}
