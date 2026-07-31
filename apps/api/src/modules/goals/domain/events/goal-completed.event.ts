import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface GoalCompletedEventProps extends DomainEventProps {
  completedBy: string;
}

export class GoalCompletedEvent extends DomainEvent {
  public readonly completedBy: string;

  constructor(props: GoalCompletedEventProps) {
    super(props);
    this.completedBy = props.completedBy;
  }
}
