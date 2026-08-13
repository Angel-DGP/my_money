import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(3, 'La descripción es requerida'),
  note: z.string().optional(),
  date: z.string(),
  // For Income/Expense
  account_id: z.string().optional(),
  category_id: z.string().optional(),
  // For Transfer
  from_account_id: z.string().optional(),
  to_account_id: z.string().optional(),
  
  // Third Party
  is_third_party: z.boolean().optional(),
  third_party_owner: z.string().optional(),
  third_party_note: z.string().optional(),
  
  // Catalogs
  payment_method: z.string().optional(),
  card_id: z.string().optional(),
  subscription_id: z.string().optional(),
  product_id: z.string().optional(),
  
  installment: z.object({
    total_installments: z.coerce.number().min(2, 'Debe ser al menos 2 meses'),
    interest_rate: z.coerce.number().optional(),
    grace_months: z.coerce.number().min(0).optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'TRANSFER') {
    if (!data.from_account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['from_account_id'], message: 'Requerido para transferencias' });
    }
    if (!data.to_account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to_account_id'], message: 'Requerido para transferencias' });
    }
    if (data.from_account_id === data.to_account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['to_account_id'], message: 'Las cuentas deben ser diferentes' });
    }
  } else {
    if (!data.account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['account_id'], message: 'Requerido' });
    }
  }
});
