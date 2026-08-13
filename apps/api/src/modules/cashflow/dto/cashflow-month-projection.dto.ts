import { Prisma } from '@mymoney/db';
import { CashflowEventDto, PrismaCashflowEventRecord } from './cashflow-event.dto';

export interface GroupedCashflowMonth {
  month: string;
  total_income: Prisma.Decimal;
  total_expense: Prisma.Decimal;
  events: PrismaCashflowEventRecord[];
}

export class CashflowMonthProjectionDto {
  month!: string;
  total_income!: string;
  total_expense!: string;
  events!: CashflowEventDto[];

  static fromGrouped(grouped: GroupedCashflowMonth): CashflowMonthProjectionDto {
    return {
      month: grouped.month,
      total_income: String(grouped.total_income),
      total_expense: String(grouped.total_expense),
      events: (grouped.events || []).map((e) => CashflowEventDto.fromPrisma(e)),
    };
  }
}
