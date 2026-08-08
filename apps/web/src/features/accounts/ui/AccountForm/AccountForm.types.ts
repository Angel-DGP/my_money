import { z } from 'zod';
import { accountSchema } from './AccountForm.schema';
import type { Account, CreateAccountDto, UpdateAccountDto } from '@entities/account';
import type { UseFormReturn } from 'react-hook-form';

export type AccountFormData = z.infer<typeof accountSchema>;

export interface AccountFormProps {
  initialData?: Account | null;
  isView?: boolean;
  onSubmit: (data: CreateAccountDto | UpdateAccountDto) => void;
  onCancel: () => void;
  isLoading?: boolean | undefined;
}

export interface AccountFormFieldsProps {
  form: UseFormReturn<AccountFormData>;
  isEdit: boolean;
  isView?: boolean;
  isLoading?: boolean | undefined;
}
