import { 
  Money, 
  Currency, 
  BalanceDelta 
} from '@mymoney/shared';
import { AccountException } from './exceptions/account.exceptions';
import { AccountType } from './account-type.enum';
import { 
  AccountCreatedEvent, 
  AccountBalanceChangedEvent,
  BalanceChangeReason,
  AccountArchivedEvent,
  AccountRestoredEvent
} from './events';

export interface CreateAccountProps {
  id?: string;
  userId: string;
  type: AccountType;
  currency: Currency;
  initialBalance: Money;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface ReconstituteAccountProps extends CreateAccountProps {
  id: string;
  currentBalance: Money;
  isActive: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export class Account {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: AccountType;
  public readonly currency: Currency;
  private _initialBalance: Money;
  private _currentBalance: Money;
  private _name: string;
  private _color: string | null;
  private _icon: string | null;
  private _isActive: boolean;

  // Audit fields
  public readonly createdAt: Date;
  public readonly createdBy: string | null;
  private _updatedAt: Date;
  private _updatedBy: string | null;
  private _deletedAt: Date | null;
  private _deletedBy: string | null;

  private constructor(props: ReconstituteAccountProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.currency = props.currency;
    this._initialBalance = props.initialBalance;
    this._currentBalance = props.currentBalance;
    this._name = props.name;
    this._color = props.color ?? null;
    this._icon = props.icon ?? null;
    this._isActive = props.isActive;

    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
    this._updatedAt = props.updatedAt;
    this._updatedBy = props.updatedBy;
    this._deletedAt = props.deletedAt ?? null;
    this._deletedBy = props.deletedBy ?? null;
  }

  static create(props: CreateAccountProps): { account: Account; event: AccountCreatedEvent } {
    if (!props.initialBalance.sameCurrency(Money.zero(props.currency))) {
      throw AccountException.currencyMismatch(props.currency, props.initialBalance.currency);
    }

    const now = new Date();
    const id = props.id || crypto.randomUUID();

    const account = new Account({
      ...props,
      id,
      currentBalance: props.initialBalance,
      isActive: true,
      createdAt: now,
      createdBy: props.userId,
      updatedAt: now,
      updatedBy: props.userId,
      deletedAt: null,
      deletedBy: null,
    });

    const event = new AccountCreatedEvent({
      accountId: account.id,
      userId: account.userId,
      initialBalance: account.initialBalance.toJSON(),
    });

    return { account, event };
  }

  static reconstitute(props: ReconstituteAccountProps): Account {
    return new Account(props);
  }

  applyBalanceDelta(delta: BalanceDelta, reason: BalanceChangeReason): AccountBalanceChangedEvent {
    if (delta.amount.currency !== this.currency) {
      throw AccountException.currencyMismatch(this.currency, delta.amount.currency);
    }

    const previousBalance = this._currentBalance;
    this._currentBalance = delta.applyTo(this._currentBalance);

    return new AccountBalanceChangedEvent({
      accountId: this.id,
      userId: this.userId,
      previousBalance: previousBalance.toJSON(),
      newBalance: this._currentBalance.toJSON(),
      reason,
    });
  }

  updateInitialBalance(newBalance: Money, updatedBy: string): void {
    if (newBalance.currency !== this.currency) {
      throw AccountException.currencyMismatch(this.currency, newBalance.currency);
    }
    
    // Note: The caller (UseCase) MUST verify using accountRepository.hasTransactions(this.id)
    // before calling this method to satisfy ACC-R02.
    
    const difference = newBalance.subtract(this._initialBalance);
    this._initialBalance = newBalance;
    
    // Adjust current balance by the same difference
    this._currentBalance = this._currentBalance.add(difference);
    
    this._updatedAt = new Date();
    this._updatedBy = updatedBy;
  }

  updateProfile(name: string, color: string | null, icon: string | null, updatedBy: string): void {
    this._name = name;
    this._color = color;
    this._icon = icon;
    
    this._updatedAt = new Date();
    this._updatedBy = updatedBy;
  }

  archive(deletedBy: string): AccountArchivedEvent {
    if (!this._isActive) {
      throw AccountException.accountAlreadyArchived();
    }

    this._isActive = false;
    this._deletedAt = new Date();
    this._deletedBy = deletedBy;
    this._updatedAt = new Date();
    this._updatedBy = deletedBy;

    return new AccountArchivedEvent({
      accountId: this.id,
      userId: this.userId,
      finalBalance: this._currentBalance.toJSON(),
      deletedBy,
    });
  }

  restore(restoredBy: string): AccountRestoredEvent {
    if (this._isActive) {
      throw AccountException.accountAlreadyActive();
    }

    this._isActive = true;
    this._deletedAt = null;
    this._deletedBy = null;
    this._updatedAt = new Date();
    this._updatedBy = restoredBy;

    return new AccountRestoredEvent({
      accountId: this.id,
      userId: this.userId,
      restoredBy,
    });
  }

  isActive(): boolean {
    return this._isActive;
  }

  get currentBalance(): Money {
    return this._currentBalance;
  }

  get initialBalance(): Money {
    return this._initialBalance;
  }

  get name(): string {
    return this._name;
  }

  get color(): string | null {
    return this._color;
  }

  get icon(): string | null {
    return this._icon;
  }
}
