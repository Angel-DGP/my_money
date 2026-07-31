import { Injectable, Inject } from '@nestjs/common';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/transaction.repository.interface';
import { TransactionPaginatedResponseDto, TransactionDto } from '../../presentation/dtos/transaction.dto';

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(userId: string, filters: any, page: number, limit: number): Promise<TransactionPaginatedResponseDto> {
    const skip = (page - 1) * limit;
    const [transactions, total] = await this.transactionRepository.findMany(userId, filters, skip, limit);

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions.map(t => TransactionDto.fromDomain(t)),
      meta: {
        total_items: total,
        total_pages: totalPages,
        current_page: page,
        per_page: limit,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
    };
  }
}
