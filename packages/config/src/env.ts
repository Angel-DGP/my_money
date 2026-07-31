import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  SESSION_SECRET: z.string().min(10),
  PORT: z.string().default('3001'),
});

// En el futuro, aquí se leerán y validarán las variables de entorno de forma agnóstica.
