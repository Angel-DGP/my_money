import { apiClient as api } from '@shared/api/client';
import type { AutoRuleDto, CreateAutoRuleDto, UpdateAutoRuleDto } from '../types/automation.types';

export const automationService = {
  async getAutoRules(activeOnly = false): Promise<AutoRuleDto[]> {
    const { data } = await api.get<AutoRuleDto[]>(`/automations`, {
      params: { activeOnly },
    });
    return data;
  },

  async createAutoRule(dto: CreateAutoRuleDto): Promise<AutoRuleDto> {
    const { data } = await api.post<AutoRuleDto>('/automations', dto);
    return data;
  },

  async updateAutoRule(id: string, dto: UpdateAutoRuleDto): Promise<AutoRuleDto> {
    const { data } = await api.put<AutoRuleDto>(`/automations/${id}`, dto);
    return data;
  },

  async deleteAutoRule(id: string): Promise<void> {
    await api.delete(`/automations/${id}`);
  },
};
