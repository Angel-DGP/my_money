import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SpendingByCategoryDto } from '../../dtos/analytics.dto';

@Injectable()
export class GetSpendingByCategoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, startDate: Date, endDate: Date): Promise<SpendingByCategoryDto[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
    });

    const categoryTotals: Record<
      string,
      {
        name: string;
        icon: string | null;
        color: string | null;
        amount: number;
        count: number;
        currency: string;
      }
    > = {};
    let totalExpense = 0;

    for (const tx of transactions) {
      const catId = tx.category_id || 'uncategorized';
      const catName = tx.category?.name || 'Sin Categoría';
      const catIcon = tx.category?.icon || 'help-circle';
      const catColor = tx.category?.color || '#94a3b8';
      const amount = Number(tx.amount);
      totalExpense += amount;

      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          name: catName,
          icon: catIcon,
          color: catColor,
          amount: 0,
          count: 0,
          currency: tx.currency || 'USD',
        };
      }

      categoryTotals[catId].amount += amount;
      categoryTotals[catId].count += 1;
    }

    const result: SpendingByCategoryDto[] = Object.entries(categoryTotals).map(([catId, data]) => ({
      category_id: catId,
      category_name: data.name,
      category_icon: data.icon,
      category_color: data.color,
      amount: Number(data.amount.toFixed(2)),
      transaction_count: data.count,
      currency: data.currency,
      percentage: totalExpense > 0 ? Number(((data.amount / totalExpense) * 100).toFixed(1)) : 0,
    }));

    return result.sort((a, b) => b.amount - a.amount);
  }
}
