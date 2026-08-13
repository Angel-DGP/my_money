import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, Input, Label, toast, Icon, ThemeToggle, FormLayout } from '@mymoney/ui';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTheme } from '@app/providers/ThemeProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          toast({ title: 'Bienvenido de vuelta', variant: 'success' });
          navigate(from, { replace: true });
        },
        onError: () => {
          toast({ title: 'Credenciales inválidas', variant: 'error' });
        }
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

          <div className="mt-12 rounded-lg bg-surface-2 p-4 text-xs text-text-secondary text-center border border-border-subtle">
            <p className="font-medium text-text-primary mb-1">Credenciales de Demostración</p>
            <p>Email: <b>demo@mymoney.app</b></p>
            <p>Contraseña: <b>demo</b></p>
          </div>
        </div>
      </div>
    </div>
  );
};
