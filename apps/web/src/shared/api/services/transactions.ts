import { apiClient } from '../client';
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateTransferDto,
} from '@entities/transaction';

export const TransactionsService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async create(data: CreateTransactionDto): Promise<Transaction> {
    const response = await apiClient.post<Transaction >('/transactions', data);
    return response.data;
  },

  async createTransfer(data: CreateTransferDto): Promise<Transaction[]> {
    const response = await apiClient.post<Transaction[]>('/transactions/transfers', data);
    return response.data;
  },

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    const response = await apiClient.patch<Transaction >(`/transactions/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },
};
