import { randomUUID } from 'crypto';

export interface DomainEventProps {
  aggregateId: string;
  eventId?: string;
  occurredAt?: Date;
  version?: number;
  requestId?: string;
  correlationId?: string;
}

export abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly version: number;
  public readonly requestId?: string;
  public readonly correlationId?: string;

  constructor(props: DomainEventProps) {
    this.aggregateId = props.aggregateId;
    this.eventId = props.eventId || randomUUID();
    this.occurredAt = props.occurredAt || new Date();
    this.version = props.version || 1;
    this.requestId = props.requestId;
    this.correlationId = props.correlationId;
  }
}
