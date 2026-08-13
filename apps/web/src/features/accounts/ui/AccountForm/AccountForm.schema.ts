import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'CREDIT', 'INVESTMENT']),
  currency: z.string().min(3, 'Moneda requerida'),
  initial_balance: z.string().optional(),
  institution_id: z.string().optional(),
  specific_type: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

