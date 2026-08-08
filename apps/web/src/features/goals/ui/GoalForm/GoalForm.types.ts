import { z } from 'zod';
import { goalSchema } from './GoalForm.schema';
import type { CreateGoalDto, UpdateGoalDto, GoalDto } from '@entities/goal';
import type { UseFormReturn } from 'react-hook-form';

export type GoalFormData = z.infer<typeof goalSchema>;

export interface GoalFormProps {
  initialData?: GoalDto | null;
  isView?: boolean;
  onSubmit: (data: CreateGoalDto | UpdateGoalDto) => void;
  onCancel: () => void;
  isLoading?: boolean | undefined;
}

export interface GoalFormFieldsProps {
  form: UseFormReturn<GoalFormData>;
  isView?: boolean;
  isLoading?: boolean | undefined;
}
