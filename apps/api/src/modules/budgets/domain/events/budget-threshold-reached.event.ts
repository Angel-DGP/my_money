import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface BudgetThresholdReachedEventProps extends DomainEventProps {
  userId: string;
  categoryId: string;
  threshold: number;
  executedAmount: { value: string; currency: string };
  budgetAmount: { value: string; currency: string };
}

export class BudgetThresholdReachedEvent extends DomainEvent {
  public readonly type = 'BudgetThresholdReached';
  public readonly userId: string;
  public readonly categoryId: string;
  public readonly threshold: number;
  public readonly executedAmount: { value: string; currency: string };
  public readonly budgetAmount: { value: string; currency: string };

  constructor(props: BudgetThresholdReachedEventProps) {
    super(props);
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.threshold = props.threshold;
    this.executedAmount = props.executedAmount;
    this.budgetAmount = props.budgetAmount;
  }
}
