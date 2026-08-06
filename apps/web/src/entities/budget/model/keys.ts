export const budgetKeys = {
  all: () => ['budgets'] as const,
  lists: () => [...budgetKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...budgetKeys.lists(), { filters }] as const,
  details: () => [...budgetKeys.all(), 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
};
