import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SpendingByCategoryDto } from '../../dtos/analytics.dto';

@Injectable()
export class GetSpendingByCategoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<SpendingByCategoryDto[]> {
    const now = new Date();
    // Start of current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: 'EXPENSE',
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      include: {
        category: true,
      },
    });

    const categoryTotals: Record<string, { name: string; icon: string | null; amount: number; currency: string }> = {};
    let totalExpense = 0;

    for (const tx of transactions) {
      if (!tx.category_id) continue;
      
      const catId = tx.category_id;
      const amount = Number(tx.amount);
      totalExpense += amount;

      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          name: tx.category?.name || 'Unknown',
          icon: tx.category?.icon || null,
          amount: 0,
          currency: tx.currency, // Assuming primary currency for now
        };
      }
      
      categoryTotals[catId].amount += amount;
    }

    const result: SpendingByCategoryDto[] = Object.entries(categoryTotals).map(([catId, data]) => ({
      category_id: catId,
      category_name: data.name,
      category_icon: data.icon,
      amount: data.amount,
      currency: data.currency,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
    }));

    // Sort by amount descending
    return result.sort((a, b) => b.amount - a.amount);
  }
}
