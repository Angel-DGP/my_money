import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MonthlyFlowResponseDto } from '../dtos/monthly-flow.dto';

@Injectable()
export class GetMonthlyFlowUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<MonthlyFlowResponseDto> {
    const now = new Date();
    
    // Current month start/end
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Previous month start/end
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentTransactions, previousTransactions] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { 
          user_id: userId,
          date: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      }),
      this.prisma.transaction.findMany({
        where: { 
          user_id: userId,
          date: { gte: previousMonthStart, lte: previousMonthEnd }
        }
      })
    ]);

    const aggregateFlow = (transactions: any[], monthLabel: string) => {
      const flowByCurrency: Record<string, { income: number, expense: number }> = {};
      
      for (const tx of transactions) {
        // Assume tx is a Transfer if category is a transfer type, etc.
        // We'll just group INCOMES vs EXPENSES based on tx.type.
        if (tx.type === 'TRANSFER') continue; // transfers don't affect net flow natively

        if (!flowByCurrency[tx.currency]) {
          flowByCurrency[tx.currency] = { income: 0, expense: 0 };
        }
        
        if (tx.type === 'INCOME') {
          flowByCurrency[tx.currency].income += tx.amount;
        } else if (tx.type === 'EXPENSE') {
          flowByCurrency[tx.currency].expense += tx.amount;
        }
      }

      return Object.entries(flowByCurrency).map(([currency, flow]) => ({
        month: monthLabel,
        currency,
        income: flow.income,
        expense: flow.expense,
        net: flow.income - flow.expense,
      }));
    };

    return {
      current_month: aggregateFlow(currentTransactions, now.toISOString().substring(0, 7)),
      previous_month: aggregateFlow(previousTransactions, new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 7)),
    };
  }
}
