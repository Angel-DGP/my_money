import { z } from 'zod';
import { goalSchema } from './GoalForm.schema';
import type { CreateGoalDto } from '@entities/goal';
import type { UseFormReturn } from 'react-hook-form';

export type GoalFormData = z.infer<typeof goalSchema>;

export interface GoalFormProps {
  onSubmit: (data: CreateGoalDto) => void;
  onCancel: () => void;
  isLoading?: boolean | undefined;
}

export interface GoalFormFieldsProps {
  form: UseFormReturn<GoalFormData>;
  isLoading?: boolean | undefined;
}
