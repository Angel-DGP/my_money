import { z } from 'zod';
import { budgetSchema } from './BudgetForm.schema';
import type { BudgetDto } from '@entities/budget';

export type BudgetFormData = z.infer<typeof budgetSchema>;

export interface CategoryOption {
  id: string;
  name: string;
}

export interface BudgetFormProps {
  initialData?: BudgetDto | null;
  isView?: boolean;
  categories: CategoryOption[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean | undefined;
}

export interface BudgetFormFieldsProps {
  form: any;
  categories: CategoryOption[];
  isEdit: boolean;
  isView?: boolean;
  isLoading?: boolean | undefined;
}
