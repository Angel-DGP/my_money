import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@mymoney/db';
import { CashflowService } from '../cashflow.service';

@Injectable()
export class TransactionCreatedHandler {
  constructor(private readonly cashflowService: CashflowService) {}

  @OnEvent('TransactionCreatedEvent')
  async handleTransactionCreated(event: any) {
    const { transaction } = event;

    // If transaction has installments, generate cashflow events
    if (transaction.installment) {
      await this.cashflowService.generateDeferredEvents(
        transaction.userId,
        transaction.id,
        new Prisma.Decimal(transaction.amount.value),
        transaction.installment.totalInstallments,
        transaction.date,
        transaction.description || 'Gasto Diferido',
        transaction.accountId
      );
    }
  }
}
