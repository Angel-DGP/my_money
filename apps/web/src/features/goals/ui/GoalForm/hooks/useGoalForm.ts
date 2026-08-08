import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema } from '../GoalForm.schema';
import type { GoalFormData } from '../GoalForm.types';
import type { CreateGoalDto, GoalDto } from '@entities/goal';

export function useGoalForm(initialData: GoalDto | null | undefined, onSubmitCallback: (data: any) => void) {
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: initialData?.name || '',
      target_amount: initialData ? Number(initialData.target_amount.value) : undefined,
      currency: initialData?.target_amount.currency || 'USD',
      target_date: initialData?.target_date ? new Date(initialData.target_date).toISOString().split('T')[0] : '',
      description: initialData?.description || '',
      priority: initialData?.priority ? String(initialData.priority) : '3',
      color: initialData?.color || '#3B82F6',
      icon: initialData?.icon || 'target',
      account_id: initialData?.account_id || '',
    } as unknown as GoalFormData,
  });

  const isEdit = !!initialData;

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
      ...(data.account_id && data.account_id !== 'none' ? { account_id: data.account_id } : {}),
    } as CreateGoalDto);
  };

  return {
    form,
    isEdit,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
