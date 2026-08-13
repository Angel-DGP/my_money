import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@mymoney/db';
import { CashflowService } from '../cashflow.service';
import { TransactionCreatedEvent } from '@mymoney/shared';

@Injectable()
export class TransactionCreatedHandler {
  private readonly logger = new Logger(TransactionCreatedHandler.name);

  constructor(private readonly cashflowService: CashflowService) {}

  @OnEvent('TransactionCreatedEvent')
  async handleTransactionCreated(event: TransactionCreatedEvent) {
    // Only generate deferred events for EXPENSE transactions with installments
    if (event.transactionType !== 'EXPENSE' || !event.installment) {
      return;
    }

    this.logger.log(
      `Generating ${event.installment.totalInstallments} deferred cashflow events for transaction ${event.transactionId}`
    );

    try {
      await this.cashflowService.generateDeferredEvents(
        event.userId,
        event.transactionId,
        new Prisma.Decimal(event.amount.value),
        event.installment.totalInstallments,
        new Date(event.date),
        event.description || 'Gasto',
        event.accountId,
      );
    } catch (err) {
      this.logger.error('Failed to generate deferred cashflow events', err);
    }
  }
}
