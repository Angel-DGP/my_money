import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, Input, Label, Icon, ThemeToggle, FormLayout } from '@mymoney/ui';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTheme } from '@app/providers/ThemeProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useServerWarmup } from '../../shared/hooks/useServerWarmup';
import { ServerWakeupNotice } from '../../shared/ui/ServerWakeupNotice';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login, isLoggingIn } = useAuth();
  const { isWakingUp, elapsedSeconds } = useServerWarmup(isLoggingIn);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          navigate(from, { replace: true });
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
                : 'Credenciales inválidas. Verifica tu correo y contraseña.');
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
          <h2 className="text-4xl font-bold tracking-tight text-center">MyMoney</h2>
          <p className="text-blue-200 text-lg text-center max-w-md">
            Toma el control absoluto de tus finanzas personales con la mejor herramienta de gestión.
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
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Iniciar Sesión</h1>
            <p className="mt-2 text-sm text-text-secondary">Ingresa tus credenciales para continuar</p>
          </div>

          <FormLayout onSubmit={handleSubmit(onSubmit)}>
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
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="demo@mymoney.app"
                leftIcon="mail"
              />
            </div>

            <div className="col-span-12 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
                leftIcon="lock"
              />
            </div>

            <div className="col-span-12 mt-2 space-y-3">
              <Button type="submit" className="w-full" loading={isLoggingIn}>
                Ingresar
              </Button>
              {isWakingUp && <ServerWakeupNotice elapsedSeconds={elapsedSeconds} />}
            </div>
          </FormLayout>

          <div className="mt-8 text-center text-sm text-text-secondary">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Regístrate ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
