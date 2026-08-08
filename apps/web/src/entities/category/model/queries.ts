import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoriesService } from '@shared/api/services/categories';
import type { UpdateCategoryDto } from '../types/category.types';
import { categoryKeys } from './keys';
import { useSessionStore } from '@entities/session';

export function useCategoriesQuery() {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: CategoriesService.getAll,
    enabled: !!token,
  });
}


export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CategoriesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => CategoriesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CategoriesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
