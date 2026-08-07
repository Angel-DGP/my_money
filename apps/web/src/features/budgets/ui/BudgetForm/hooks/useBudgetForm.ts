import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema } from '../BudgetForm.schema';
import type { BudgetFormData } from '../BudgetForm.types';
import type { BudgetDto, CreateBudgetDto, UpdateBudgetDto } from '@entities/budget';

export function useBudgetForm(initialData?: BudgetDto | null, onSubmitCallback?: (data: CreateBudgetDto | UpdateBudgetDto) => void) {
  const isEdit = !!initialData;

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: initialData?.category_id || '',
      period: (initialData?.period as 'MONTHLY' | 'YEARLY') || 'MONTHLY',
      amount: initialData ? parseFloat(initialData.amount.value) : undefined,
      currency: initialData?.amount?.currency || 'USD',
      start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      alert_threshold: initialData?.alert_threshold || 80,
      soft_limit: initialData?.soft_limit ? parseFloat(initialData.soft_limit.value) : undefined,
      hard_limit: initialData?.hard_limit ? parseFloat(initialData.hard_limit.value) : undefined,
      carry_over: initialData?.carry_over || false,
      ignore_refunds: initialData?.ignore_refunds || false,
      ignore_transfers: initialData?.ignore_transfers ?? true,
      is_frozen: initialData?.is_frozen || false,
      notes: initialData?.notes || '',
    } as unknown as BudgetFormData, // Zod handles the typing after defaultValues initialization, undefined to empty string can be tricky without casting here
  });

  const onSubmit = (data: BudgetFormData) => {
    if (!onSubmitCallback) return;

    if (isEdit) {
      onSubmitCallback({
        amount: data.amount.toString(),
        currency: data.currency,
        alert_threshold: data.alert_threshold,
        soft_limit: data.soft_limit ? data.soft_limit.toString() : undefined,
        hard_limit: data.hard_limit ? data.hard_limit.toString() : undefined,
        carry_over: data.carry_over,
        ignore_refunds: data.ignore_refunds,
        ignore_transfers: data.ignore_transfers,
        is_frozen: data.is_frozen,
        notes: data.notes || undefined,
      } as UpdateBudgetDto);
    } else {
      onSubmitCallback({
        category_id: data.category_id,
        period: data.period.toLowerCase() as 'monthly' | 'yearly',
        amount: data.amount.toString(),
        currency: data.currency,
        start_date: data.start_date,
        alert_threshold: data.alert_threshold,
        soft_limit: data.soft_limit ? data.soft_limit.toString() : undefined,
        hard_limit: data.hard_limit ? data.hard_limit.toString() : undefined,
        carry_over: data.carry_over,
        ignore_refunds: data.ignore_refunds,
        ignore_transfers: data.ignore_transfers,
        notes: data.notes || undefined,
      } as CreateBudgetDto);
    }
  };

  return {
    form,
    isEdit,
    onSubmit: form.handleSubmit(onSubmit as any),
  };
}
