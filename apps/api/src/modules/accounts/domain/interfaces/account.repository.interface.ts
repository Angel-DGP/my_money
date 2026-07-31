import { IRepository } from '@mymoney/shared';
import { Account } from '../account.entity';

export interface IAccountRepository extends IRepository<Account, string> {
  findAllActiveByUser(userId: string): Promise<Account[]>;
  
  /**
   * Checks if an account has any associated transactions.
   * Required for Business Rule ACC-R02.
   */
  hasTransactions(accountId: string): Promise<boolean>;
  
  /**
   * Checks if an active account with the given name exists for the user.
   */
  existsByNameAndUser(name: string, userId: string): Promise<boolean>;
}

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');
