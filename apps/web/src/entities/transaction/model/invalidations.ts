import { QueryClient } from '@tanstack/react-query';
import { transactionKeys } from './keys';
import { accountKeys } from '../../account/model/keys';

export const transactionInvalidations = {
  onCreate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
  },
  onUpdate: (queryClient: QueryClient, id: string) => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
  },
  onDelete: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
  }
};
