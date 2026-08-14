import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@mymoney/db';
import { CashflowService } from '../cashflow.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionCreatedEvent } from '@mymoney/shared';

@Injectable()
export class TransactionCreatedHandler {
  private readonly logger = new Logger(TransactionCreatedHandler.name);

  constructor(
    private readonly cashflowService: CashflowService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('TransactionCreatedEvent')
  @OnEvent('TransactionCreated')
  async handleTransactionCreated(event: TransactionCreatedEvent) {
    // 1. Generate deferred events for EXPENSE transactions with installments
    if (event.transactionType === 'EXPENSE' && event.installment) {
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

    // 2. If transaction has a subscriptionId, mark corresponding month's cashflow event as PAID
    if (event.subscriptionId && event.subscriptionId !== 'none') {
      try {
        const txDate = new Date(event.date);
        const startOfMonth = new Date(Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));

        const updated = await this.prisma.cashflowEvent.updateMany({
          where: {
            user_id: event.userId,
            reference_id: event.subscriptionId,
            source_type: 'SUBSCRIPTION',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          data: {
            status: 'PAID',
            account_id: event.accountId,
          },
        });

        if (updated.count === 0) {
          const sub = await this.prisma.subscription.findUnique({
            where: { id: event.subscriptionId },
          });
          if (sub) {
            await this.prisma.cashflowEvent.create({
              data: {
                user_id: event.userId,
                amount: new Prisma.Decimal(event.amount.value),
                type: 'EXPENSE',
                date: new Date(event.date),
                source_type: 'SUBSCRIPTION',
                reference_id: event.subscriptionId,
                description: `Suscripción: ${sub.name}`,
                status: 'PAID',
                account_id: event.accountId,
              },
            });
          }
        }

        this.logger.log(`Marked subscription event as PAID for subscription ${event.subscriptionId}`);
      } catch (err) {
        this.logger.error('Failed to update subscription cashflow event status', err);
      }
    }
  }
}
