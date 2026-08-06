import { apiClient } from '../client';
import type { Account, CreateAccountDto, UpdateAccountDto } from '@entities/account';

export const AccountsService = {
  async getAll(): Promise<Account[]> {
    const response = await apiClient.get<Account[] >('/accounts');
    return response.data;
  },

  async getById(id: string): Promise<Account> {
    const response = await apiClient.get<Account>(`/accounts/${id}`);
    return response.data;
  },

  async create(data: CreateAccountDto): Promise<Account> {
    const response = await apiClient.post<Account>('/accounts', data);
    return response.data;
  },

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    const response = await apiClient.patch<Account>(`/accounts/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },
};
