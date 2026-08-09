import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '../AccountForm.schema';
import type { AccountFormData } from '../AccountForm.types';
import type { Account, CreateAccountDto, UpdateAccountDto } from '@entities/account';

export function useAccountForm(initialData?: Account | null, onSubmitCallback?: (data: CreateAccountDto | UpdateAccountDto) => void) {
  const isEdit = !!initialData;

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: (initialData?.type as AccountFormData['type']) || 'CHECKING',
      currency: initialData?.currency || 'USD',
      initial_balance: initialData?.current_balance.value || '0.00',
      institution_id: initialData?.institution_id || (initialData ? 'none' : ''),
      specific_type: initialData?.specific_type || '',
    },
  });

  const onSubmit = (data: AccountFormData) => {
    if (!onSubmitCallback) return;

    if (isEdit) {
      onSubmitCallback({
        name: data.name,
        type: data.type,
        currency: data.currency,
        institution_id: data.institution_id === 'none' ? undefined : (data.institution_id || undefined),
        specific_type: data.specific_type || undefined,
      } as UpdateAccountDto);
    } else {
      onSubmitCallback({
        name: data.name,
        type: data.type,
        currency: data.currency,
        initial_balance: data.initial_balance,
        color: '#10B981',
        icon: 'wallet',
        institution_id: data.institution_id === 'none' ? undefined : (data.institution_id || undefined),
        specific_type: data.specific_type || undefined,
      } as CreateAccountDto);
    }
  };

  return {
    form,
    isEdit,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
