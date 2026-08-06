import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationService } from '../api/automation.service';
import type { CreateAutoRuleDto, UpdateAutoRuleDto } from '../types/automation.types';

export const automationKeys = {
  all: ['automations'] as const,
  lists: () => [...automationKeys.all, 'list'] as const,
  list: (filters: { activeOnly?: boolean }) => [...automationKeys.lists(), filters] as const,
};

export function useAutoRules(activeOnly = false) {
  return useQuery({
    queryKey: automationKeys.list({ activeOnly }),
    queryFn: () => automationService.getAutoRules(activeOnly),
  });
}

export function useCreateAutoRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateAutoRuleDto) => automationService.createAutoRule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.lists() });
    },
  });
}

export function useUpdateAutoRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAutoRuleDto }) => 
      automationService.updateAutoRule(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.lists() });
    },
  });
}

export function useDeleteAutoRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => automationService.deleteAutoRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.lists() });
    },
  });
}
