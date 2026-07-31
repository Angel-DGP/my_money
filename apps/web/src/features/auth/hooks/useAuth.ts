import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../../../shared/api/services/auth';
import { useSessionStore } from '../../../entities/session/model/store';
import { toast } from '@mymoney/ui';

export function useAuth() {
  const { setSession, clearSession } = useSessionStore();

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      toast({
        title: 'Bienvenido',
        description: `Has iniciado sesión como ${data.user.name}`,
        variant: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error de autenticación',
        description: error.response?.data?.message || 'Credenciales inválidas',
        variant: 'error',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSettled: () => {
      clearSession();
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
