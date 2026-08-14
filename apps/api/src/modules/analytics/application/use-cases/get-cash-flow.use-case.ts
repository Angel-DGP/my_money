import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CashFlowDto } from '../../dtos/analytics.dto';

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

@Injectable()
export class GetCashFlowUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, monthsToFetch: number = 6): Promise<CashFlowDto[]> {
    const now = new Date();
    
    // Start of the Nth month ago
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsToFetch - 1), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: { in: ['INCOME', 'EXPENSE'] },
        date: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
        currency: true,
      },
    });

    const monthlyData: Record<
      string,
      { income: number; expense: number; currency: string; label: string }
    > = {};
    
    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const label = `${MONTH_LABELS[monthIndex]} ${monthsToFetch > 12 ? year : ''}`.trim();
      
      monthlyData[monthKey] = {
        income: 0,
        expense: 0,
        currency: 'USD',
        label,
      };
    }

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      const year = txDate.getFullYear();
      const monthIndex = txDate.getMonth();
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

      if (monthlyData[monthKey]) {
        const amount = Number(tx.amount);
        monthlyData[monthKey].currency = tx.currency || 'USD';
        if (tx.type === 'INCOME') {
          monthlyData[monthKey].income += amount;
        } else if (tx.type === 'EXPENSE') {
          monthlyData[monthKey].expense += amount;
        }
      }
    }

    return Object.entries(monthlyData)
      .map(([month, data]) => {
        const income = Number(data.income.toFixed(2));
        const expense = Number(data.expense.toFixed(2));
        const net = Number((income - expense).toFixed(2));
        return {
          month,
          label: data.label,
          income,
          expense,
          net,
          currency: data.currency,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
