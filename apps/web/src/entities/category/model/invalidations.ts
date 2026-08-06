import { QueryClient } from '@tanstack/react-query';
import { categoryKeys } from './keys';

export const categoryInvalidations = {
  onCreate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  },
  onUpdate: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
  },
  onDelete: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  }
};
