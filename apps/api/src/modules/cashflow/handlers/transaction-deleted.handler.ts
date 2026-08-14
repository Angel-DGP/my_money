import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionDeletedEvent } from '@mymoney/shared';

@Injectable()
export class TransactionDeletedHandler {
  private readonly logger = new Logger(TransactionDeletedHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('TransactionDeletedEvent')
  @OnEvent('TransactionDeleted')
  async handleTransactionDeleted(event: TransactionDeletedEvent) {
    // 1. If transaction was a subscription payment, unmark the latest PAID event back to PENDING
    if (event.subscriptionId && event.subscriptionId !== 'none') {
      try {
        const paidEvent = await this.prisma.cashflowEvent.findFirst({
          where: {
            user_id: event.userId,
            reference_id: event.subscriptionId,
            source_type: 'SUBSCRIPTION',
            status: 'PAID',
          },
          orderBy: { date: 'desc' },
        });

        if (paidEvent) {
          await this.prisma.cashflowEvent.update({
            where: { id: paidEvent.id },
            data: {
              status: 'PENDING',
              account_id: null,
            },
          });
          this.logger.log(
            `Reverted subscription cashflow event ${paidEvent.id} to PENDING after deleting transaction ${event.transactionId}`
          );
        }
      } catch (err) {
        this.logger.error('Failed to revert subscription cashflow event status', err);
      }
    }

    // 2. If transaction had deferred installment events, remove them
    try {
      const deletedDeferred = await this.prisma.cashflowEvent.deleteMany({
        where: {
          user_id: event.userId,
          reference_id: event.transactionId,
          source_type: 'INSTALLMENT',
        },
      });

      if (deletedDeferred.count > 0) {
        this.logger.log(
          `Removed ${deletedDeferred.count} deferred cashflow events for deleted transaction ${event.transactionId}`
        );
      }
    } catch (err) {
      this.logger.error('Failed to cleanup deferred cashflow events on transaction deletion', err);
    }
  }
}
