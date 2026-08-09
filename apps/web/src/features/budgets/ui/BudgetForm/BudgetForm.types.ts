import { z } from 'zod';
import { budgetSchema } from './BudgetForm.schema';
import type { BudgetDto } from '@entities/budget';

import type { UseFormReturn } from 'react-hook-form';

export type BudgetFormData = z.infer<typeof budgetSchema>;

export interface CategoryOption {
  id: string;
  name: string;
}

export interface BudgetFormProps {
  initialData?: BudgetDto | null;
  isView?: boolean;
  categories: CategoryOption[];
  onSubmit: (data: BudgetFormData) => void;
  onCancel: () => void;
  isLoading?: boolean | undefined;
}

export interface BudgetFormFieldsProps {
  form: UseFormReturn<BudgetFormData>;
  categories: CategoryOption[];
  isEdit: boolean;
  isView?: boolean;
  isLoading?: boolean | undefined;
}
