import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountsService } from '@shared/api/services/accounts';
import type { UpdateAccountDto } from '../types/account.types';
import { accountKeys } from './keys';
import { useSessionStore } from '@entities/session';

export function useAccountsQuery() {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: AccountsService.getAll,
    enabled: !!token,
  });
}

export function useAccountDetailQuery(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => AccountsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AccountsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDto }) => AccountsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AccountsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}
