import { z } from 'zod';

export const budgetSchema = z.object({
  category_id: z.string().min(1, 'La categoría es requerida'),
  period: z.enum(['MONTHLY', 'YEARLY']),
  amount: z.number().min(0.01, 'El límite debe ser mayor a 0'),
  currency: z.string().min(3, 'Moneda requerida'),
  start_date: z.string(),
  alert_threshold: z.number().min(1).max(100),
  soft_limit: z.number().optional().nullable(),
  hard_limit: z.number().optional().nullable(),
  carry_over: z.boolean(),
  ignore_refunds: z.boolean(),
  ignore_transfers: z.boolean(),
  is_frozen: z.boolean(),
  notes: z.string().optional(),
});
