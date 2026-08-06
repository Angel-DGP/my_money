import { QueryClient } from '@tanstack/react-query';
import { accountKeys } from './keys';

export const accountInvalidations = {
  onCreate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
  },
  onUpdate: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) });
  },
  onDelete: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
  }
};
