import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export type BalanceChangeReason = 'TRANSACTION_CREATED' | 'TRANSACTION_DELETED' | 'TRANSACTION_UPDATED' | 'INITIAL_BALANCE_ADJUSTED';

export interface AccountBalanceChangedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  accountId: string;
  userId: string;
  previousBalance: { value: string; currency: string };
  newBalance: { value: string; currency: string };
  reason: BalanceChangeReason;
}

export class AccountBalanceChangedEvent extends DomainEvent {
  public readonly type = 'AccountBalanceChanged' as const;
  public readonly accountId: string;
  public readonly userId: string;
  public readonly previousBalance: { value: string; currency: string };
  public readonly newBalance: { value: string; currency: string };
  public readonly reason: BalanceChangeReason;

  constructor(props: AccountBalanceChangedEventProps) {
    super({ ...props, aggregateId: props.accountId });
    this.accountId = props.accountId;
    this.userId = props.userId;
    this.previousBalance = props.previousBalance;
    this.newBalance = props.newBalance;
    this.reason = props.reason;
  }
}
