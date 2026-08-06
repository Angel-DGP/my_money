import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsService } from '@shared/api/services/goals';
import type { CreateGoalDto, AddGoalProgressDto } from '../types/goal.types';
import { goalKeys } from './keys';
import { goalInvalidations } from './invalidations';
import { useSessionStore } from '@entities/session';

export function useGoalsQuery(status?: string) {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: goalKeys.list(status),
    queryFn: () => GoalsService.getAll(status),
    enabled: !!token,
  });
}

export function useGoalQuery(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => GoalsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalDto) => GoalsService.create(data),
    onSuccess: () => {
      goalInvalidations.onCreate(queryClient);
    },
  });
}

export function useAddGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddGoalProgressDto }) => GoalsService.addProgress(id, data),
    onSuccess: (_, variables) => {
      goalInvalidations.onAddProgress(queryClient, variables.id);
    },
  });
}
