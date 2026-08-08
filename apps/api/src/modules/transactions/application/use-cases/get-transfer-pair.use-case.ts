import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { TransactionDto } from '../../presentation/dtos/transaction.dto';

@Injectable()
export class GetTransferPairUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(pairId: string, userId: string): Promise<{ data: TransactionDto[] }> {
    const transactions = await this.transactionRepository.findByTransferPairId(pairId, userId);
    
    if (!transactions || transactions.length === 0) {
      throw new NotFoundException('Transfer pair not found');
    }

    return {
      data: transactions.map(t => TransactionDto.fromDomain(t))
    };
  }
}
