import React from 'react';
import { TransactionsListWidget } from '../../../widgets/transactions/TransactionsListWidget';

export function TransactionsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <TransactionsListWidget />
    </div>
  );
}
