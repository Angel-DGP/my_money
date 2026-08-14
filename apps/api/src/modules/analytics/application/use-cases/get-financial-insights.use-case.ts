import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FinancialInsightDto, TopExpenseDto } from '../../dtos/analytics.dto';

@Injectable()
export class GetFinancialInsightsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    startDate: Date,
    endDate: Date,
    summary: {
      total_income: number;
      total_expense: number;
      net_savings: number;
      savings_rate: number;
    }
  ): Promise<{ top_expenses: TopExpenseDto[]; insights: FinancialInsightDto[] }> {
    // 1. Top expenses
    const rawExpenses = await this.prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
      orderBy: {
        amount: 'desc',
      },
      take: 5,
    });

    const top_expenses: TopExpenseDto[] = rawExpenses.map((tx) => ({
      id: tx.id,
      description: tx.description || 'Gasto no especificado',
      amount: Number(Number(tx.amount).toFixed(2)),
      currency: tx.currency || 'USD',
      date: tx.date instanceof Date ? tx.date.toISOString().split('T')[0]! : String(tx.date),
      category_name: tx.category?.name || 'General',
      category_icon: tx.category?.icon || null,
      category_color: tx.category?.color || null,
    }));

    // 2. Generate smart dynamic insights
    const insights: FinancialInsightDto[] = [];

    // Savings rate insight
    if (summary.total_income > 0) {
      if (summary.savings_rate >= 20) {
        insights.push({
          id: 'savings-good',
          type: 'SUCCESS',
          title: 'Excelente Tasa de Ahorro',
          message: `Estás ahorrando el ${summary.savings_rate}% de tus ingresos totales. ¡Superas la regla recomendada del 20%!`,
          badge: `${summary.savings_rate}%`,
        });
      } else if (summary.savings_rate > 0) {
        insights.push({
          id: 'savings-moderate',
          type: 'INFO',
          title: 'Oportunidad de Ahorro',
          message: `Tu tasa de ahorro es del ${summary.savings_rate}%. Intenta reducir gastos hormiga para alcanzar la meta ideal del 20%.`,
          badge: `${summary.savings_rate}%`,
        });
      } else {
        insights.push({
          id: 'savings-warning',
          type: 'WARNING',
          title: 'Gastos Superan Ingresos',
          message: `Has gastado más de lo que ingresaste en este periodo. Revisa tus categorías de mayor volumen para balancear tu flujo.`,
          badge: 'Atención',
        });
      }
    }

    // Top expense insight
    if (top_expenses.length > 0 && summary.total_expense > 0) {
      const highest = top_expenses[0]!;
      const percentOfTotal = ((highest.amount / summary.total_expense) * 100).toFixed(1);
      insights.push({
        id: 'top-expense-dominant',
        type: Number(percentOfTotal) > 35 ? 'WARNING' : 'NEUTRAL',
        title: `Mayor Gasto: ${highest.description}`,
        message: `Representa el ${percentOfTotal}% de todos tus gastos en este periodo (${highest.category_name}).`,
        badge: `${percentOfTotal}% del total`,
      });
    }

    // Default neutral tip if few insights
    if (insights.length < 2) {
      insights.push({
        id: 'budget-tip',
        type: 'INFO',
        title: 'Monitoreo de Presupuestos',
        message: 'Configura alertas en tus categorías principales para no excederte del límite mensual planificado.',
        badge: 'Tip Proactivo',
      });
    }

    return { top_expenses, insights };
  }
}
