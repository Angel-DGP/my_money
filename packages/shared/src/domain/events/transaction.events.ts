import { DomainEvent, DomainEventProps } from './domain-event.base.js';

export interface TransactionCreatedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  transactionId: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  amount: { value: string; currency: string };
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
  description?: string | null;
  transferPairId: string | null;
  subscriptionId?: string | null;
  installment?: {
    totalInstallments: number;
    interestRate: number | null;
    graceMonths: number;
  } | null;
}

export class TransactionCreatedEvent extends DomainEvent {
  public readonly type = 'TransactionCreated' as const;
  public readonly transactionId: string;
  public readonly userId: string;
  public readonly accountId: string;
  public readonly categoryId: string | null;
  public readonly amount: { value: string; currency: string };
  public readonly transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  public readonly date: string;
  public readonly description: string | null;
  public readonly transferPairId: string | null;
  public readonly subscriptionId?: string | null;
  public readonly installment?: {
    totalInstallments: number;
    interestRate: number | null;
    graceMonths: number;
  } | null;

  constructor(props: TransactionCreatedEventProps) {
    super({ ...props, aggregateId: props.transactionId });
    this.transactionId = props.transactionId;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.transactionType = props.transactionType;
    this.date = props.date;
    this.description = props.description ?? null;
    this.transferPairId = props.transferPairId;
    this.subscriptionId = props.subscriptionId ?? null;
    this.installment = props.installment ?? null;
  }
}

export interface TransactionAmountChangedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  transactionId: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  previousAmount: { value: string; currency: string };
  newAmount: { value: string; currency: string };
  delta: { value: string; currency: string };
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
}

export class TransactionAmountChangedEvent extends DomainEvent {
  public readonly type = 'TransactionAmountChanged' as const;
  public readonly transactionId: string;
  public readonly userId: string;
  public readonly accountId: string;
  public readonly categoryId: string | null;
  public readonly previousAmount: { value: string; currency: string };
  public readonly newAmount: { value: string; currency: string };
  public readonly delta: { value: string; currency: string };
  public readonly transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  public readonly date: string;

  constructor(props: TransactionAmountChangedEventProps) {
    super({ ...props, aggregateId: props.transactionId });
    this.transactionId = props.transactionId;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId;
    this.previousAmount = props.previousAmount;
    this.newAmount = props.newAmount;
    this.delta = props.delta;
    this.transactionType = props.transactionType;
    this.date = props.date;
  }
}

export interface TransactionDateChangedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  transactionId: string;
  userId: string;
  categoryId: string | null;
  amount: { value: string; currency: string };
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  previousDate: string;
  newDate: string;
}

export class TransactionDateChangedEvent extends DomainEvent {
  public readonly type = 'TransactionDateChanged' as const;
  public readonly transactionId: string;
  public readonly userId: string;
  public readonly categoryId: string | null;
  public readonly amount: { value: string; currency: string };
  public readonly transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  public readonly previousDate: string;
  public readonly newDate: string;

  constructor(props: TransactionDateChangedEventProps) {
    super({ ...props, aggregateId: props.transactionId });
    this.transactionId = props.transactionId;
    this.userId = props.userId;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.transactionType = props.transactionType;
    this.previousDate = props.previousDate;
    this.newDate = props.newDate;
  }
}

export interface TransactionCategoryChangedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  transactionId: string;
  userId: string;
  amount: { value: string; currency: string };
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
  previousCategoryId: string | null;
  newCategoryId: string | null;
}

export class TransactionCategoryChangedEvent extends DomainEvent {
  public readonly type = 'TransactionCategoryChanged' as const;
  public readonly transactionId: string;
  public readonly userId: string;
  public readonly amount: { value: string; currency: string };
  public readonly transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  public readonly date: string;
  public readonly previousCategoryId: string | null;
  public readonly newCategoryId: string | null;

  constructor(props: TransactionCategoryChangedEventProps) {
    super({ ...props, aggregateId: props.transactionId });
    this.transactionId = props.transactionId;
    this.userId = props.userId;
    this.amount = props.amount;
    this.transactionType = props.transactionType;
    this.date = props.date;
    this.previousCategoryId = props.previousCategoryId;
    this.newCategoryId = props.newCategoryId;
  }
}

export interface TransactionDeletedEventProps extends Omit<DomainEventProps, 'aggregateId'> {
  transactionId: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  amount: { value: string; currency: string };
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
  deletedBy: string;
}

export class TransactionDeletedEvent extends DomainEvent {
  public readonly type = 'TransactionDeleted' as const;
  public readonly transactionId: string;
  public readonly userId: string;
  public readonly accountId: string;
  public readonly categoryId: string | null;
  public readonly amount: { value: string; currency: string };
  public readonly transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  public readonly date: string;
  public readonly deletedBy: string;

  constructor(props: TransactionDeletedEventProps) {
    super({ ...props, aggregateId: props.transactionId });
    this.transactionId = props.transactionId;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.transactionType = props.transactionType;
    this.date = props.date;
    this.deletedBy = props.deletedBy;
  }
}
