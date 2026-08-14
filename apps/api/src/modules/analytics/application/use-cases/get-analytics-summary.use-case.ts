import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AnalyticsSummaryDto } from '../../dtos/analytics.dto';

@Injectable()
export class GetAnalyticsSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    currentStart: Date,
    currentEnd: Date,
    prevStart: Date,
    prevEnd: Date
  ): Promise<AnalyticsSummaryDto> {
    // Current period transactions
    const currentTx = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: { in: ['INCOME', 'EXPENSE'] },
        date: { gte: currentStart, lte: currentEnd },
      },
      select: {
        amount: true,
        type: true,
        currency: true,
      },
    });

    // Previous period transactions
    const prevTx = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: { in: ['INCOME', 'EXPENSE'] },
        date: { gte: prevStart, lte: prevEnd },
      },
      select: {
        amount: true,
        type: true,
      },
    });

    let currentIncome = 0;
    let currentExpense = 0;
    let currency = 'USD';

    for (const tx of currentTx) {
      const amt = Number(tx.amount);
      if (tx.currency) currency = tx.currency;
      if (tx.type === 'INCOME') currentIncome += amt;
      else if (tx.type === 'EXPENSE') currentExpense += amt;
    }

    let prevIncome = 0;
    let prevExpense = 0;
    for (const tx of prevTx) {
      const amt = Number(tx.amount);
      if (tx.type === 'INCOME') prevIncome += amt;
      else if (tx.type === 'EXPENSE') prevExpense += amt;
    }

    const netSavings = currentIncome - currentExpense;
    const savingsRate = currentIncome > 0 ? Number(((netSavings / currentIncome) * 100).toFixed(1)) : 0;

    // Calculate days in current period
    const msDiff = Math.max(1, currentEnd.getTime() - currentStart.getTime());
    const daysInPeriod = Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24)));
    const avgDailyExpense = Number((currentExpense / daysInPeriod).toFixed(2));

    const incomeTrendPercentage = prevIncome > 0
      ? Number((((currentIncome - prevIncome) / prevIncome) * 100).toFixed(1))
      : currentIncome > 0 ? 100 : 0;

    const expenseTrendPercentage = prevExpense > 0
      ? Number((((currentExpense - prevExpense) / prevExpense) * 100).toFixed(1))
      : currentExpense > 0 ? 100 : 0;

    return {
      total_income: Number(currentIncome.toFixed(2)),
      total_expense: Number(currentExpense.toFixed(2)),
      net_savings: Number(netSavings.toFixed(2)),
      savings_rate: savingsRate,
      avg_daily_expense: avgDailyExpense,
      currency,
      previous_period_income: Number(prevIncome.toFixed(2)),
      previous_period_expense: Number(prevExpense.toFixed(2)),
      income_trend_percentage: incomeTrendPercentage,
      expense_trend_percentage: expenseTrendPercentage,
      transaction_count: currentTx.length,
    };
  }
}
