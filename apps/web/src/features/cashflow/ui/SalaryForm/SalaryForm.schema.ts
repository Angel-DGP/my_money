import { z } from 'zod';

export const salarySchema = z.object({
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(3, 'La descripción es requerida'),
  startDate: z.string(),
  months: z.coerce.number().min(1, 'Debe ser al menos 1 mes').max(60, 'Máximo 60 meses'),
  accountId: z.string().min(1, 'Selecciona una cuenta'),
});

export type SalaryFormData = z.infer<typeof salarySchema>;
