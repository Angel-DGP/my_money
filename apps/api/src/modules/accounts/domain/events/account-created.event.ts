import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface AccountCreatedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  accountId: string;
  userId: string;
  initialBalance: { value: string; currency: string };
}

export class AccountCreatedEvent extends DomainEvent {
  public readonly type = 'AccountCreated' as const;
  public readonly accountId: string;
  public readonly userId: string;
  public readonly initialBalance: { value: string; currency: string };

  constructor(props: AccountCreatedEventProps) {
    super({ ...props, aggregateId: props.accountId });
    this.accountId = props.accountId;
    this.userId = props.userId;
    this.initialBalance = props.initialBalance;
  }
}
