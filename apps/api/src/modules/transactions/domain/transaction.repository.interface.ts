import { IRepository } from '@mymoney/shared';
import { Transaction } from './transaction.entity';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface ITransactionRepository extends IRepository<Transaction, string> {
  findByTransferPairId(transferPairId: string, userId: string): Promise<Transaction[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findMany(userId: string, filters: Record<string, unknown>, skip: number, take: number): Promise<[Transaction[], number]>;
}
