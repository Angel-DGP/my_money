import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@shared/api/services/auth';
import { useSessionStore } from '@entities/session';
import { toast } from '@mymoney/ui';

export function useAuth() {
  const { setSession, clearSession } = useSessionStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      setSession(data.token, data.user, data.refreshToken);
      toast({
        title: 'Bienvenido',
        description: `Has iniciado sesión como ${data.user.name}`,
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error de autenticación',
        description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Credenciales inválidas',
        variant: 'error',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      setSession(data.token, data.user, data.refreshToken);
      toast({
        title: 'Registro exitoso',
        description: `Bienvenido a MyMoney, ${data.user.name}`,
        variant: 'success',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error de registro',
        description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'No se pudo crear la cuenta',
        variant: 'error',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSettled: () => {
      // Orden garantizado:
      // 1. Limpiar toda la caché de React Query (no quedan datos de otro usuario)
      // 2. Limpiar la sesión del store (token, user)
      // 3. Navegar al login
      queryClient.clear();
      clearSession();
      navigate('/login', { replace: true });
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
