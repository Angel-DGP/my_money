import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/interfaces/account.repository.interface';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const account = await this.accountRepository.findById(id, userId);
    
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const event = account.archive(userId);

    await this.accountRepository.save(account);

    this.eventEmitter.emit(event.constructor.name, event);
  }
}
