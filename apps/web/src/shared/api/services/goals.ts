import { apiClient } from '../client';
import type { CreateGoalDto, AddGoalProgressDto, GoalDto, UpdateGoalDto } from '@entities/goal';

export const GoalsService = {
  async getAll(status?: string): Promise<GoalDto[]> {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<GoalDto[]>('/goals', { params });
    return data;
  },

  async getById(id: string): Promise<GoalDto> {
    const { data } = await apiClient.get<GoalDto>(`/goals/${id}`);
    return data;
  },

  async create(payload: CreateGoalDto): Promise<GoalDto> {
    const { data } = await apiClient.post<GoalDto>('/goals', payload);
    return data;
  },

  async update(id: string, payload: UpdateGoalDto): Promise<GoalDto> {
    const { data } = await apiClient.patch<GoalDto>(`/goals/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },

  async addProgress(id: string, payload: AddGoalProgressDto): Promise<GoalDto> {
    const { data } = await apiClient.post<GoalDto>(`/goals/${id}/add-progress`, payload);
    return data;
  },
};
