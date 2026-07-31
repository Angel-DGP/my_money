import { apiClient } from '../client';
import type { 
  Transaction, 
  CreateTransactionDto, 
  UpdateTransactionDto,
  CreateTransferDto,
  PaginatedResponse 
} from '../../../entities/transaction/types/transaction.types';

export const TransactionsService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    throw new Error('Not implemented: TransactionsService.getAll');
    // const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params });
    // return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    throw new Error('Not implemented: TransactionsService.getById');
    // const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    // return response.data;
  },

  async create(data: CreateTransactionDto): Promise<Transaction> {
    throw new Error('Not implemented: TransactionsService.create');
    // const response = await apiClient.post<Transaction>('/transactions', data);
    // return response.data;
  },

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    throw new Error('Not implemented: TransactionsService.update');
    // const response = await apiClient.patch<Transaction>(`/transactions/${id}`, data);
    // return response.data;
  },

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented: TransactionsService.remove');
    // await apiClient.delete(`/transactions/${id}`);
  },

  async createTransfer(data: CreateTransferDto): Promise<void> {
    throw new Error('Not implemented: TransactionsService.createTransfer');
    // await apiClient.post('/transactions/transfer', data);
  }
};
