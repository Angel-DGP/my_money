import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/interfaces/account.repository.interface';
import { AccountDto } from '../../presentation/dtos/account.dto';

@Injectable()
export class ListAccountsUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(userId: string): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findAllActiveByUser(userId);
    
    return accounts.map(AccountDto.fromDomain);
  }
}
