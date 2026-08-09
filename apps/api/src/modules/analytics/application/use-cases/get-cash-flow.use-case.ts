import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CashFlowDto } from '../../dtos/analytics.dto';

@Injectable()
export class GetCashFlowUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<CashFlowDto[]> {
    const now = new Date();
    // We want the last 6 months including the current one
    const monthsToFetch = 6;
    
    // Start of the 6th month ago
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
      }
    });

    // Initialize the last 6 months with 0
    const monthlyData: Record<string, { income: number; expense: number; currency: string }> = {};
    
    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthLabel] = { income: 0, expense: 0, currency: 'USD' }; // Default currency
    }

    for (const tx of transactions) {
      const monthLabel = tx.date.toISOString().substring(0, 7);
      if (monthlyData[monthLabel]) {
        const amount = Number(tx.amount);
        monthlyData[monthLabel].currency = tx.currency; // Update to actual currency
        if (tx.type === 'INCOME') {
          monthlyData[monthLabel].income += amount;
        } else if (tx.type === 'EXPENSE') {
          monthlyData[monthLabel].expense += amount;
        }
      }
    }

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      currency: data.currency,
    })).sort((a, b) => a.month.localeCompare(b.month)); // Ascending order
  }
}
