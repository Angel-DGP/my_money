import { QueryClient } from '@tanstack/react-query';
import { budgetKeys } from './keys';

export const budgetInvalidations = {
  onCreate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
  },
  onUpdate: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) });
  },
  onDelete: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
  }
};
