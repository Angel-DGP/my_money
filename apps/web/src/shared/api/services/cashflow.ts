import { apiClient } from '../client';

export interface CashflowEvent {
  id: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  source_type: 'SALARY' | 'INSTALLMENT' | 'SUBSCRIPTION';
  description?: string;
  reference_id?: string;
}

export interface CashflowMonthProjection {
  month: string;
  total_income: string;
  total_expense: string;
  events: CashflowEvent[];
}

export const CashflowService = {
  getProjections: async (startDate: string, endDate: string, accountId?: string): Promise<CashflowMonthProjection[]> => {
    const { data } = await apiClient.get('/cashflow/projections', {
      params: { startDate, endDate, ...(accountId ? { accountId } : {}) }
    });
    return data;
  },

  registerSalary: async (payload: { amount: number, startDate: string, months: number, accountId: string, description?: string }) => {
    const { data } = await apiClient.post('/cashflow/salaries', payload);
    return data;
  }
};
