import { UpdateTransactionUseCase } from './update-transaction.use-case';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionType } from '../../domain/transaction-type.enum';
import { Account } from '../../../accounts/domain/account.entity';
import { AccountType } from '../../../accounts/domain/account-type.enum';
import { Money } from '@mymoney/shared';
import { NotFoundException } from '@nestjs/common';

describe('UpdateTransactionUseCase', () => {
  let useCase: UpdateTransactionUseCase;
  let mockTransactionRepo: Record<string, jest.Mock>;
  let mockAccountRepo: Record<string, jest.Mock>;
  let mockCategoryRepo: Record<string, jest.Mock>;
  let mockUoW: Record<string, jest.Mock>;
  let mockEventEmitter: Record<string, jest.Mock>;

  const userId = '11111111-1111-1111-1111-111111111111';
  const accountId1 = '22222222-2222-2222-2222-222222222222';
  const accountId2 = '33333333-3333-3333-3333-333333333333';

  function createTestAccount(id: string, balance = '1000') {
    return Account.reconstitute({
      id,
      userId,
      type: AccountType.CHECKING,
      currency: 'USD',
      initialBalance: Money.of(balance, 'USD'),
      currentBalance: Money.of(balance, 'USD'),
      name: `Account-${id.slice(0, 4)}`,
      isActive: true,
      createdAt: new Date(),
      createdBy: userId,
      updatedAt: new Date(),
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null,
    });
  }

  function createTestTransaction(accountId: string, amount = '50', type = TransactionType.EXPENSE) {
    return Transaction.create({
      userId,
      accountId,
      categoryId: null,
      type,
      amount: Money.of(amount, 'USD'),
      description: 'Test transaction',
      date: new Date('2026-08-18T10:00:00.000Z'),
      transferPairId: null,
      isRecurring: false,
      isThirdParty: false,
      thirdPartyOwner: null,
      thirdPartyNote: null,
      paymentMethod: null,
      cardId: null,
      subscriptionId: null,
      productId: null,
      installment: null,
    });
  }

  beforeEach(() => {
    mockTransactionRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockAccountRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockCategoryRepo = {
      findById: jest.fn(),
    };
    mockUoW = {
      execute: jest.fn(async (cb) => await cb()),
    };
    mockEventEmitter = {
      emit: jest.fn(),
    };

    useCase = new UpdateTransactionUseCase(
      mockTransactionRepo as any,
      mockAccountRepo as any,
      mockCategoryRepo as any,
      mockUoW as any,
      mockEventEmitter as any
    );
  });

  it('should throw NotFoundException if transaction does not exist', async () => {
    mockTransactionRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('invalid-id', userId, { amount: '100' })).rejects.toThrow(NotFoundException);
  });

  it('should update amount on the same account and adjust balance delta', async () => {
    const tx = createTestTransaction(accountId1, '50', TransactionType.EXPENSE);
    const account = createTestAccount(accountId1, '500');

    mockTransactionRepo.findById.mockResolvedValue(tx);
    mockAccountRepo.findById.mockResolvedValue(account);

    const result = await useCase.execute(tx.id, userId, { amount: '80' });

    expect(result.amount.value).toBe('80');
    // Expense increased by 30, so balance decreases from 500 to 470
    expect(account.currentBalance.value.toString()).toBe('470');
    expect(mockTransactionRepo.save).toHaveBeenCalled();
    expect(mockAccountRepo.save).toHaveBeenCalledWith(account);
  });

  it('should update account and recalculate balances on both old and new accounts', async () => {
    const tx = createTestTransaction(accountId1, '50', TransactionType.EXPENSE);
    const oldAccount = createTestAccount(accountId1, '500');
    const newAccount = createTestAccount(accountId2, '1000');

    mockTransactionRepo.findById.mockResolvedValue(tx);
    mockAccountRepo.findById.mockImplementation(async (id: string) => {
      if (id === accountId1) return oldAccount;
      if (id === accountId2) return newAccount;
      return null;
    });

    const result = await useCase.execute(tx.id, userId, {
      account_id: accountId2,
      amount: '75',
    });

    expect(result.account_id).toBe(accountId2);
    expect(result.amount.value).toBe('75');
    // Old account reverts previous expense of 50: 500 + 50 = 550
    expect(oldAccount.currentBalance.value.toString()).toBe('550');
    // New account applies new expense of 75: 1000 - 75 = 925
    expect(newAccount.currentBalance.value.toString()).toBe('925');
    expect(mockAccountRepo.save).toHaveBeenCalledWith(oldAccount);
    expect(mockAccountRepo.save).toHaveBeenCalledWith(newAccount);
  });

  it('should update date with time on the same date successfully', async () => {
    const tx = createTestTransaction(accountId1, '50', TransactionType.EXPENSE);
    mockTransactionRepo.findById.mockResolvedValue(tx);

    const newIsoDate = '2026-08-18T18:45:00.000Z';
    const result = await useCase.execute(tx.id, userId, {
      date: newIsoDate,
    });

    expect(new Date(result.date).toISOString()).toBe(newIsoDate);
    expect(mockTransactionRepo.save).toHaveBeenCalled();
  });
});
