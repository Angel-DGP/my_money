import { DomainEvent, DomainEventProps } from '@mymoney/shared';

export interface CategoryDeletedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  categoryId: string;
  userId: string;
}

export class CategoryDeletedEvent extends DomainEvent {
  public readonly type = 'CategoryDeleted' as const;
  public readonly categoryId: string;
  public readonly userId: string;

  constructor(props: CategoryDeletedEventProps) {
    super({ ...props, aggregateId: props.categoryId });
    this.categoryId = props.categoryId;
    this.userId = props.userId;
  }
}
