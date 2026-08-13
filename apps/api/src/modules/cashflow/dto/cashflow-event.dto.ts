export interface PrismaCashflowEventRecord {
  id: string;
  amount: unknown;
  type: string;
  date: Date | string;
  status: string;
  source_type: string;
  description?: string | null;
  reference_id?: string | null;
}

export class CashflowEventDto {
  id!: string;
  amount!: string;
  type!: 'INCOME' | 'EXPENSE';
  date!: string;
  status!: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  source_type!: 'SALARY' | 'INSTALLMENT' | 'SUBSCRIPTION';
  description?: string | null;
  reference_id?: string | null;

  static fromPrisma(record: PrismaCashflowEventRecord): CashflowEventDto {
    return {
      id: record.id,
      amount: String(record.amount),
      type: record.type as 'INCOME' | 'EXPENSE',
      date: record.date instanceof Date ? record.date.toISOString().split('T')[0] : String(record.date),
      status: record.status as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED',
      source_type: record.source_type as 'SALARY' | 'INSTALLMENT' | 'SUBSCRIPTION',
      description: record.description,
      reference_id: record.reference_id,
    };
  }
}
