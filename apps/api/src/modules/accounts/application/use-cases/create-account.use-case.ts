import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, BusinessRuleViolationException } from '@mymoney/shared';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/interfaces/account.repository.interface';
import { Account } from '../../domain/account.entity';
import { CreateAccountDto } from '../../presentation/dtos/create-account.dto';
import { AccountDto } from '../../presentation/dtos/account.dto';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, dto: CreateAccountDto): Promise<AccountDto> {
    const exists = await this.accountRepository.existsByNameAndUser(dto.name, userId);
    if (exists) {
      throw new BusinessRuleViolationException('ACCOUNT_NAME_EXISTS', 'An active account with this name already exists.');
    }

    const initialBalance = Money.of(dto.initial_balance, dto.currency);

    const { account, event } = Account.create({
      userId,
      name: dto.name,
      type: dto.type,
      currency: dto.currency,
      initialBalance,
      color: dto.color,
      icon: dto.icon,
    });

    await this.accountRepository.save(account);

    // Emit event asynchronously
    this.eventEmitter.emit(event.type, event);

    return AccountDto.fromDomain(account);
  }
}
