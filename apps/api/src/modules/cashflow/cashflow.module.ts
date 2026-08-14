import { Module } from '@nestjs/common';
import { CashflowController } from './cashflow.controller';
import { CashflowService } from './cashflow.service';
import { TransactionCreatedHandler } from './handlers/transaction-created.handler';
import { TransactionDeletedHandler } from './handlers/transaction-deleted.handler';
import { PrismaModule } from '../../prisma/prisma.module';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, AccountsModule, TransactionsModule],
  controllers: [CashflowController],
  providers: [CashflowService, TransactionCreatedHandler, TransactionDeletedHandler],
  exports: [CashflowService],
})
export class CashflowModule {}
