import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Label, toast, Icon, ThemeToggle, FormLayout } from '@mymoney/ui';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTheme } from '@app/providers/ThemeProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
    registerUser(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => {
          navigate('/');
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
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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
            
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <Button type="submit" className="w-full mt-2" loading={isRegistering}>
              Registrarse
            </Button>
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
