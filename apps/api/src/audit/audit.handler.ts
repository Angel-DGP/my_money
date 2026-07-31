import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { auditContextStorage } from './audit.context';

@Injectable()
export class AuditHandler {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('domain.event.*')
  async handleAuditLogEvent(event: {
    entityType: string;
    entityId: string;
    action: string; // Must be 'CREATE' | 'UPDATE' | 'DELETE' based on Prisma Schema
    previousData?: unknown;
    newData?: unknown;
  }) {
    const context = auditContextStorage.getStore();

    // Use user_id from context, or fallback to a known SYSTEM UUID
    const userId = context?.userId || '00000000-0000-0000-0000-000000000000';

    await this.prisma.auditLog.create({
      data: {
        user_id: userId,
        entity_type: event.entityType,
        entity_id: event.entityId,
        action: event.action,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        previous_data: event.previousData ? (event.previousData as any) : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new_data: event.newData ? (event.newData as any) : undefined,
        request_id: context?.requestId,
        correlation_id: context?.correlationId,
      },
    });
  }
}
