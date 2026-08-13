export interface PrismaCashflowEventRecord {
  id: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  date: Date | string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  source_type: 'SALARY' | 'INSTALLMENT' | 'SUBSCRIPTION';
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
      type: record.type,
      date: record.date instanceof Date ? record.date.toISOString().split('T')[0] : record.date,
      status: record.status,
      source_type: record.source_type,
      description: record.description,
      reference_id: record.reference_id,
    };
  }
}
