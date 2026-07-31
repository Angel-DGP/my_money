import React from 'react';
import { TransactionCard } from '@mymoney/ui';
import type { Transaction } from '../../../entities/transaction/types/transaction.types';

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

export function TransactionsList({ transactions, onTransactionClick }: TransactionsListProps) {
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          title={transaction.description || 'Sin descripción'}
          subtitle={transaction.type === 'TRANSFER' ? 'Transferencia' : (transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto')}
          amount={parseFloat(transaction.amount.value)}
          currency={transaction.amount.currency}
          type={transaction.type === 'INCOME' ? 'income' : (transaction.type === 'EXPENSE' ? 'expense' : 'neutral')}
          date={transaction.date}
          iconName={transaction.type === 'INCOME' ? 'arrow-down-left' : (transaction.type === 'EXPENSE' ? 'arrow-up-right' : 'repeat')}
          onClick={() => onTransactionClick(transaction)}
        />
      ))}
    </div>
  );
}
