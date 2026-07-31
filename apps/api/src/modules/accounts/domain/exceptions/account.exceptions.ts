import { BusinessRuleViolationException } from '@mymoney/shared';

export class AccountException extends BusinessRuleViolationException {
  constructor(code: string, message: string, rule?: string) {
    super(code, message, rule);
  }

  static currencyMismatch(accountCurrency: string, otherCurrency: string): AccountException {
    return new AccountException(
      'ACC_001',
      `Currency mismatch: Expected ${accountCurrency}, but got ${otherCurrency}.`
    );
  }

  static accountAlreadyArchived(): AccountException {
    return new AccountException(
      'ACC_002',
      'Account is already archived.'
    );
  }

  static accountAlreadyActive(): AccountException {
    return new AccountException(
      'ACC_003',
      'Account is already active.'
    );
  }
}
