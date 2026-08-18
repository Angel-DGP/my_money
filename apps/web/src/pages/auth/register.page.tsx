import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Label, Icon, ThemeToggle, FormLayout } from '@mymoney/ui';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTheme } from '@app/providers/ThemeProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useServerWarmup } from '../../shared/hooks/useServerWarmup';
import { ServerWakeupNotice } from '../../shared/ui/ServerWakeupNotice';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerUser, isRegistering } = useAuth();
  const { isWakingUp, elapsedSeconds } = useServerWarmup(isRegistering);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    registerUser(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => {
          navigate('/');
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            code?: string;
            response?: { data?: { message?: string | string[] } };
            message?: string;
          };
          const rawMsg = axiosErr?.response?.data?.message;
          const msg = Array.isArray(rawMsg)
            ? rawMsg.join(', ')
            : rawMsg ||
              (axiosErr?.code === 'ECONNABORTED'
                ? 'El servidor tardó demasiado en responder. Intenta de nuevo.'
                : 'No se pudo crear la cuenta. Verifica los datos ingresados.');
          setServerError(msg);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado Izquierdo (Visual) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-blue-900 text-blue-50 p-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <Icon name="coins" className="w-32 h-32 text-blue-400" />
          <h2 className="text-4xl font-bold tracking-tight text-center">Únete a MyMoney</h2>
          <p className="text-blue-200 text-lg text-center max-w-md">
            Comienza a tomar decisiones financieras inteligentes hoy mismo. Es rápido, fácil y seguro.
          </p>
        </div>
      </div>

      {/* Lado Derecho (Formulario) */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-12 xl:px-24 relative bg-surface">
        <div className="absolute top-6 right-6">
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Crear cuenta</h1>
            <p className="mt-2 text-sm text-text-secondary">Ingresa tus datos para registrarte</p>
          </div>
          
          <FormLayout className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div
                role="alert"
                className="col-span-12 p-3.5 rounded-xl border border-error-500/30 bg-error-500/10 text-error-600 dark:text-error-400 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <Icon name="alert-circle" size="xs" className="mt-0.5 shrink-0" />
                <span className="flex-1 font-medium leading-relaxed">{serverError}</span>
              </div>
            )}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="name">Nombre completo</Label>
              <Input 
                id="name" 
                type="text" 
                {...register('name')}
                error={errors.name?.message}
                placeholder="Juan Pérez"
                leftIcon="user"
              />
            </div>

            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')}
                error={errors.email?.message}
                placeholder="tu@correo.com"
                leftIcon="mail"
              />
            </div>
            
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
                leftIcon="lock"
              />
            </div>

            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="••••••••"
                leftIcon="lock"
              />
            </div>

            <div className="col-span-12 mt-2 space-y-3">
              <Button type="submit" className="w-full" loading={isRegistering}>
                Registrarse
              </Button>
              {isWakingUp && <ServerWakeupNotice elapsedSeconds={elapsedSeconds} />}
            </div>
          </FormLayout>

          <div className="mt-8 text-center text-sm text-text-secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
