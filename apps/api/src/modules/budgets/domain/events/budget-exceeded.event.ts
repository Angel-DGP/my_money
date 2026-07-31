import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface BudgetExceededEventProps extends DomainEventProps {
  userId: string;
  categoryId: string;
  executedAmount: { value: string; currency: string };
  budgetAmount: { value: string; currency: string };
  excessAmount: { value: string; currency: string };
}

export class BudgetExceededEvent extends DomainEvent {
  public readonly type = 'BudgetExceeded';
  public readonly userId: string;
  public readonly categoryId: string;
  public readonly executedAmount: { value: string; currency: string };
  public readonly budgetAmount: { value: string; currency: string };
  public readonly excessAmount: { value: string; currency: string };

  constructor(props: BudgetExceededEventProps) {
    super(props);
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.executedAmount = props.executedAmount;
    this.budgetAmount = props.budgetAmount;
    this.excessAmount = props.excessAmount;
  }
}
