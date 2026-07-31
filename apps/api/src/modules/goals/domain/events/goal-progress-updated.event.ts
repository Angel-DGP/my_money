import { DomainEvent, DomainEventProps, Money } from '@mymoney/shared';

export interface GoalProgressUpdatedEventProps extends DomainEventProps {
  amountAdded: Money;
  newCurrentAmount: Money;
  targetAmount: Money;
  updatedBy: string;
}

export class GoalProgressUpdatedEvent extends DomainEvent {
  public readonly amountAdded: Money;
  public readonly newCurrentAmount: Money;
  public readonly targetAmount: Money;
  public readonly updatedBy: string;

  constructor(props: GoalProgressUpdatedEventProps) {
    super(props);
    this.amountAdded = props.amountAdded;
    this.newCurrentAmount = props.newCurrentAmount;
    this.targetAmount = props.targetAmount;
    this.updatedBy = props.updatedBy;
  }
}
