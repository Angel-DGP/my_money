import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/interfaces/account.repository.interface';
import { AccountDto } from '../../presentation/dtos/account.dto';

@Injectable()
export class GetAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(id: string, userId: string): Promise<AccountDto> {
    const account = await this.accountRepository.findById(id, userId);
    
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return AccountDto.fromDomain(account);
  }
}
