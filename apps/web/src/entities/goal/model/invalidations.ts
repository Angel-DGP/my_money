import { QueryClient } from '@tanstack/react-query';
import { goalKeys } from './keys';

export const goalInvalidations = {
  onCreate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
  },
  onAddProgress: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) });
  },
  onUpdate: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) });
  },
  onDelete: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
  },
};
