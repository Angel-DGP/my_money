import { Module } from '@nestjs/common';
import { CashflowController } from './cashflow.controller';
import { CashflowService } from './cashflow.service';
import { TransactionCreatedHandler } from './handlers/transaction-created.handler';

@Module({
  controllers: [CashflowController],
  providers: [CashflowService, TransactionCreatedHandler]
})
export class CashflowModule {}
