import { z } from 'zod';
import { transactionSchema } from './TransactionForm.schema';
import type { Transaction } from '@entities/transaction';
import type { UseFormReturn } from 'react-hook-form';

export type TransactionFormData = z.infer<typeof transactionSchema>;

export interface TransactionFormProps {
  initialData?: Transaction;
  isView?: boolean;
}

export interface TransactionFormFieldsProps {
  form: UseFormReturn<TransactionFormData>;
  isEdit: boolean;
  isView?: boolean;
}
