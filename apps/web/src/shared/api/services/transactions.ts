import { apiClient } from '../client';
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateTransferDto,
  PaginatedResponse,
} from '@entities/transaction';

export interface TransactionQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  account_id?: string | undefined;
  category_id?: string | undefined;
  type?: string | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
}

export const TransactionsService = {
  async getAll(params?: TransactionQueryParams): Promise<Transaction[] & { meta?: PaginatedResponse<Transaction>['meta'] }> {
    const response = await apiClient.get<Transaction[]>('/transactions', { params });
    return response.data as unknown as Transaction[] & { meta?: PaginatedResponse<Transaction>['meta'] };
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async getTransferPair(pairId: string): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(`/transactions/transfers/${pairId}`);
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
