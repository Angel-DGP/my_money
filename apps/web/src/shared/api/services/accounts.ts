import { apiClient } from '../client';
import { Account, CreateAccountDto, UpdateAccountDto } from '../../../entities/account/types/account.types';

export const AccountsService = {
  async getAll(): Promise<Account[]> {
    throw new Error('Not implemented: AccountsService.getAll');
    // const response = await apiClient.get<Account[]>('/accounts');
    // return response.data;
  },

  async getById(id: string): Promise<Account> {
    throw new Error('Not implemented: AccountsService.getById');
    // const response = await apiClient.get<Account>(`/accounts/${id}`);
    // return response.data;
  },

  async create(data: CreateAccountDto): Promise<Account> {
    throw new Error('Not implemented: AccountsService.create');
    // const response = await apiClient.post<Account>('/accounts', data);
    // return response.data;
  },

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    throw new Error('Not implemented: AccountsService.update');
    // const response = await apiClient.patch<Account>(`/accounts/${id}`, data);
    // return response.data;
  },

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented: AccountsService.remove');
    // await apiClient.delete(`/accounts/${id}`);
  }
};
