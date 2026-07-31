import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface BudgetExpiredEventProps extends DomainEventProps {
  userId: string;
  categoryId: string;
}

export class BudgetExpiredEvent extends DomainEvent {
  public readonly type = 'BudgetExpired';
  public readonly userId: string;
  public readonly categoryId: string;

  constructor(props: BudgetExpiredEventProps) {
    super(props);
    this.userId = props.userId;
    this.categoryId = props.categoryId;
  }
}
