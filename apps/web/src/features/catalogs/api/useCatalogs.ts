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

export const useCardTypes = () => {
  return useQuery({
    queryKey: ['card-types'],
    queryFn: CatalogsService.getCardTypes,
  });
};

export const useCreateCardType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CatalogsService.createCardType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-types'] });
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
