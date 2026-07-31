import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface AccountRestoredEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  accountId: string;
  userId: string;
  restoredBy: string;
}

export class AccountRestoredEvent extends DomainEvent {
  public readonly type = 'AccountRestored' as const;
  public readonly accountId: string;
  public readonly userId: string;
  public readonly restoredBy: string;

  constructor(props: AccountRestoredEventProps) {
    super({ ...props, aggregateId: props.accountId });
    this.accountId = props.accountId;
    this.userId = props.userId;
    this.restoredBy = props.restoredBy;
  }
}
