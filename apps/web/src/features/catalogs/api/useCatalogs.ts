import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CatalogsService } from '../../../shared/api/services/catalogs';

export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: CatalogsService.getInstitutions,
  });
};

export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.createInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => CatalogsService.updateInstitution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

export const useDeleteInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

export const useCardBrands = () => {
  return useQuery({
    queryKey: ['card-brands'],
    queryFn: CatalogsService.getCardBrands,
  });
};

export const useCreateCardBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.createCardBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-brands'] });
    },
  });
};

export const useUpdateCardBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => CatalogsService.updateCardBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-brands'] });
    },
  });
};

export const useDeleteCardBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.deleteCardBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-brands'] });
    },
  });
};



export const useCards = () => {
  return useQuery({
    queryKey: ['cards'],
    queryFn: CatalogsService.getCards,
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => CatalogsService.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: CatalogsService.getSubscriptions,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['projections'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => CatalogsService.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['projections'] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['projections'] });
    },
  });
};

export const usePaySubscriptionMonth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { accountId: string; date?: string } }) =>
      CatalogsService.paySubscriptionMonth(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['projections'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useProductServices = () => {
  return useQuery({
    queryKey: ['product-services'],
    queryFn: CatalogsService.getProductServices,
  });
};

export const useCreateProductService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.createProductService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-services'] });
    },
  });
};

export const useUpdateProductService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => CatalogsService.updateProductService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-services'] });
    },
  });
};

export const useDeleteProductService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.deleteProductService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-services'] });
    },
  });
};
