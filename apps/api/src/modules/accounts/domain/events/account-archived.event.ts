import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface AccountArchivedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  accountId: string;
  userId: string;
  finalBalance: { value: string; currency: string };
  deletedBy: string;
}

export class AccountArchivedEvent extends DomainEvent {
  public readonly type = 'AccountArchived' as const;
  public readonly accountId: string;
  public readonly userId: string;
  public readonly finalBalance: { value: string; currency: string };
  public readonly deletedBy: string;

  constructor(props: AccountArchivedEventProps) {
    super({ ...props, aggregateId: props.accountId });
    this.accountId = props.accountId;
    this.userId = props.userId;
    this.finalBalance = props.finalBalance;
    this.deletedBy = props.deletedBy;
  }
}
