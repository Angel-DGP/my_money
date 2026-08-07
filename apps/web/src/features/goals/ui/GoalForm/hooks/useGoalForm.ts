import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema } from '../GoalForm.schema';
import type { GoalFormData } from '../GoalForm.types';
import type { CreateGoalDto } from '@entities/goal';

export function useGoalForm(onSubmitCallback: (data: CreateGoalDto) => void) {
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: undefined,
      currency: 'USD',
      target_date: '',
      description: '',
      priority: '3',
      color: '#3B82F6',
      icon: 'target',
      account_id: '',
    } as unknown as GoalFormData,
  });

  const onSubmit = (data: GoalFormData) => {
    onSubmitCallback({
      name: data.name,
      target_amount: data.target_amount,
      currency: data.currency,
      priority: Number(data.priority),
      color: data.color || '#3B82F6',
      icon: data.icon || 'target',
      ...(data.target_date ? { target_date: data.target_date } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.account_id ? { account_id: data.account_id } : {}),
    } as CreateGoalDto);
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
