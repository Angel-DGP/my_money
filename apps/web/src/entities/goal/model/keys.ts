export const goalKeys = {
  all: () => ['goals'] as const,
  lists: () => [...goalKeys.all(), 'list'] as const,
  list: (status?: string) => [...goalKeys.lists(), { status }] as const,
  details: () => [...goalKeys.all(), 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
};
