import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido'),
  target_amount: z.number().min(0.01, 'El objetivo debe ser mayor a 0'),
  currency: z.string().min(3, 'Moneda requerida'),
  target_date: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['1', '2', '3']),
  color: z.string().optional(),
  icon: z.string().optional(),
  account_id: z.string().optional(),
});
