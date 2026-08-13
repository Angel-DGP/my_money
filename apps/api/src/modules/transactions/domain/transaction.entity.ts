import { DomainEvent } from '@mymoney/shared';
import { randomUUID } from 'crypto';
import { Money, TransactionCreatedEvent, TransactionDeletedEvent, TransactionAmountChangedEvent, TransactionDateChangedEvent, TransactionCategoryChangedEvent } from '@mymoney/shared';
import { TransactionType } from './transaction-type.enum';
import { 
  InvalidTransactionAmountException, 
  InvalidTransactionDateException, 
  CannotEditTransferTransactionException
} from './exceptions/transaction.exceptions';

export interface TransactionInstallmentProps {
  totalInstallments: number;
  interestRate: number | null;
  graceMonths: number;
}

export interface TransactionProps {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: Money;
  description: string | null;
  date: Date;
  transferPairId: string | null;
  isRecurring: boolean;
  isThirdParty: boolean;
  thirdPartyOwner: string | null;
  thirdPartyNote: string | null;
  paymentMethod: string | null;
  cardId: string | null;
  subscriptionId: string | null;
  productId: string | null;
  installment: TransactionInstallmentProps | null;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  account?: { id: string; name: string; icon: string | null } | null;
  category?: { id: string; name: string; icon: string | null } | null;
}

export class Transaction {
  private props: TransactionProps;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: TransactionProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get accountId(): string { return this.props.accountId; }
  get categoryId(): string | null { return this.props.categoryId; }
  get type(): TransactionType { return this.props.type; }
  get amount(): Money { return this.props.amount; }
  get description(): string | null { return this.props.description; }
  get date(): Date { return this.props.date; }
  get transferPairId(): string | null { return this.props.transferPairId; }
  get isRecurring(): boolean { return this.props.isRecurring; }
  get isThirdParty(): boolean { return this.props.isThirdParty; }
  get thirdPartyOwner(): string | null { return this.props.thirdPartyOwner; }
  get thirdPartyNote(): string | null { return this.props.thirdPartyNote; }
  get paymentMethod(): string | null { return this.props.paymentMethod; }
  get cardId(): string | null { return this.props.cardId; }
  get subscriptionId(): string | null { return this.props.subscriptionId; }
  get productId(): string | null { return this.props.productId; }
  get installment(): TransactionInstallmentProps | null { return this.props.installment; }
  get createdAt(): Date { return this.props.createdAt; }
  get createdBy(): string | null { return this.props.createdBy; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get updatedBy(): string | null { return this.props.updatedBy; }
  get deletedAt(): Date | null { return this.props.deletedAt; }
  get deletedBy(): string | null { return this.props.deletedBy; }
  get account() { return this.props.account; }
  get category() { return this.props.category; }

  get isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  get isTransfer(): boolean {
    return this.props.transferPairId !== null;
  }

  // Events
  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Validates invariants before creation or update
   */
  private static validateDate(date: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(maxFutureDate.getDate() + 7);
    
    if (date > maxFutureDate) {
      throw new InvalidTransactionDateException();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private validateNotTransfer(_operation: string): void {
    if (this.isTransfer) {
      throw new CannotEditTransferTransactionException();
    }
  }

  /**
   * Factory method for creating a new Transaction
   */
  public static create(
    props: Omit<TransactionProps, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>
  ): Transaction {
    if (props.amount.value.lte(0)) {
      throw new InvalidTransactionAmountException();
    }

    Transaction.validateDate(props.date);

    const now = new Date();
    const transaction = new Transaction({
      ...props,
      id: randomUUID(),
      createdAt: now,
      createdBy: props.userId,
      updatedAt: now,
      updatedBy: props.userId,
      deletedAt: null,
      deletedBy: null,
      installment: props.installment ?? null,
    });

    transaction.addDomainEvent(new TransactionCreatedEvent({
      transactionId: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: { value: transaction.amount.value.toString(), currency: transaction.amount.currency },
      transactionType: transaction.type,
      date: transaction.date.toISOString(),
      description: transaction.description,
      transferPairId: transaction.transferPairId,
      installment: transaction.installment ? {
        totalInstallments: transaction.installment.totalInstallments,
        interestRate: transaction.installment.interestRate,
        graceMonths: transaction.installment.graceMonths,
      } : null,
      occurredAt: new Date(),
    }));

    return transaction;
  }

  /**
   * Reconstitutes an existing Transaction from DB
   */
  public static reconstitute(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  /**
   * Modifies the amount (TRX-R06)
   */
  public updateAmount(newAmount: Money, updatedBy: string): void {
    this.validateNotTransfer('updateAmount');
    
    if (newAmount.value.lte(0)) {
      throw new InvalidTransactionAmountException();
    }
    
    if (this.props.amount.currency !== newAmount.currency) {
      throw new Error('Cannot change transaction currency'); // Internal error, shouldn't happen from API
    }

    if (this.props.amount.value.eq(newAmount.value)) {
      return;
    }

    const previousAmount = this.props.amount;
    const delta = newAmount.subtract(previousAmount);
    
    this.props.amount = newAmount;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;

    this.addDomainEvent(new TransactionAmountChangedEvent({
      transactionId: this.id,
      userId: this.userId,
      accountId: this.accountId,
      categoryId: this.categoryId,
      previousAmount: { value: previousAmount.value.toString(), currency: previousAmount.currency },
      newAmount: { value: newAmount.value.toString(), currency: newAmount.currency },
      delta: { value: delta.value.toString(), currency: delta.currency },
      transactionType: this.type,
      date: this.date.toISOString(),
      occurredAt: new Date(),
    }));
  }

  /**
   * Modifies the date (TRX-R07)
   */
  public updateDate(newDate: Date, updatedBy: string): void {
    this.validateNotTransfer('updateDate');
    
    // Convert both dates to ISO date strings for comparison to avoid time discrepancies
    const currentDateStr = this.props.date.toISOString().split('T')[0];
    const newDateStr = newDate.toISOString().split('T')[0];

    if (currentDateStr === newDateStr) {
      return;
    }

    Transaction.validateDate(newDate);

    const previousDate = this.props.date;
    this.props.date = newDate;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;

    this.addDomainEvent(new TransactionDateChangedEvent({
      transactionId: this.id,
      userId: this.userId,
      categoryId: this.categoryId,
      amount: { value: this.amount.value.toString(), currency: this.amount.currency },
      transactionType: this.type,
      previousDate: previousDate.toISOString(),
      newDate: newDate.toISOString(),
      occurredAt: new Date(),
    }));
  }

  /**
   * Modifies the category (TRX-R08)
   */
  public updateCategory(newCategoryId: string | null, updatedBy: string): void {
    this.validateNotTransfer('updateCategory');

    if (this.props.categoryId === newCategoryId) {
      return;
    }

    const previousCategoryId = this.props.categoryId;
    this.props.categoryId = newCategoryId;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;

    this.addDomainEvent(new TransactionCategoryChangedEvent({
      transactionId: this.id,
      userId: this.userId,
      amount: { value: this.amount.value.toString(), currency: this.amount.currency },
      transactionType: this.type,
      date: this.date.toISOString(),
      previousCategoryId,
      newCategoryId,
      occurredAt: new Date(),
    }));
  }

  public updateThirdPartyStatus(isThirdParty: boolean, owner: string | null, note: string | null, updatedBy: string): void {
    this.props.isThirdParty = isThirdParty;
    this.props.thirdPartyOwner = owner;
    this.props.thirdPartyNote = note;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  public updateMetadata(
    paymentMethod: string | null,
    cardId: string | null,
    subscriptionId: string | null,
    productId: string | null,
    updatedBy: string
  ): void {
    this.props.paymentMethod = paymentMethod;
    this.props.cardId = cardId;
    this.props.subscriptionId = subscriptionId;
    this.props.productId = productId;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  /**
   * Modifies the description
   */
  public updateDescription(newDescription: string | null, updatedBy: string): void {
    this.validateNotTransfer('updateDescription');
    
    if (this.props.description === newDescription) return;

    this.props.description = newDescription;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  /**
   * Archiva la transacción (Soft Delete, TRX-R09, TRX-R10)
   */
  public softDelete(deletedBy: string): void {
    if (this.isDeleted) return;

    // Soft delete of transfer individual items is NOT allowed (TRF-R05). 
    // They must be deleted by deleting the transfer pair.
    if (this.isTransfer) {
      throw new CannotEditTransferTransactionException();
    }

    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.updatedAt = new Date();
    this.props.updatedBy = deletedBy;

    this.addDomainEvent(new TransactionDeletedEvent({
      transactionId: this.id,
      userId: this.userId,
      accountId: this.accountId,
      categoryId: this.categoryId,
      amount: { value: this.amount.value.toString(), currency: this.amount.currency },
      transactionType: this.type,
      date: this.date.toISOString(),
      deletedBy,
      occurredAt: new Date(),
    }));
  }

  /**
   * Soft Delete bypassing transfer check (for internal use when deleting a transfer pair)
   */
  public softDeleteAsTransfer(deletedBy: string): void {
    if (this.isDeleted) return;
    if (!this.isTransfer) throw new Error('Not a transfer');

    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.updatedAt = new Date();
    this.props.updatedBy = deletedBy;

    this.addDomainEvent(new TransactionDeletedEvent({
      transactionId: this.id,
      userId: this.userId,
      accountId: this.accountId,
      categoryId: this.categoryId,
      amount: { value: this.amount.value.toString(), currency: this.amount.currency },
      transactionType: this.type,
      date: this.date.toISOString(),
      deletedBy,
      occurredAt: new Date(),
    }));
  }
}
