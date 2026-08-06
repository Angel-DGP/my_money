import { Module } from '@nestjs/common';
import { TransactionsController } from './presentation/transactions.controller';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { CreateTransferUseCase } from './application/use-cases/create-transfer.use-case';
import { PrismaTransactionRepository } from './infrastructure/prisma/prisma-transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/transaction.repository.interface';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { AuthModule } from '../../auth/auth.module';
import { SessionsModule } from '../../sessions/sessions.module';

@Module({
  imports: [
    AccountsModule,
    CategoriesModule,
    AuthModule,
    SessionsModule,
  ],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    ListTransactionsUseCase,
    CreateTransferUseCase,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
