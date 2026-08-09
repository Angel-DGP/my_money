import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { InsightDto, InsightType } from '../dtos/insight.dto';
import { FinancialHealthScoreDto } from '../dtos/health-score.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInsights(userId: string): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];
    const now = new Date();

    // 1. Budget Overspending Risk
    const budgets = await this.prisma.budget.findMany({
      where: { user_id: userId, status: 'ACTIVE' },
      include: { category: true }
    });

    for (const budget of budgets) {
      if (Number(budget.executed_amount) > Number(budget.amount)) {
        insights.push({
          id: randomUUID(),
          type: 'WARNING',
          title: 'Presupuesto excedido',
          description: `Has excedido tu presupuesto de ${budget.category?.name || 'la categoría'}.`,
          action_label: 'Ver presupuesto',
          action_url: `/budgets`,
          created_at: now.toISOString(),
        });
      } else if (Number(budget.executed_amount) > Number(budget.amount) * 0.8) {
        insights.push({
          id: randomUUID(),
          type: 'WARNING',
          title: 'Presupuesto en riesgo',
          description: `Has consumido más del 80% de tu presupuesto de ${budget.category?.name || 'la categoría'}.`,
          action_label: 'Ver detalles',
          action_url: `/budgets`,
          created_at: now.toISOString(),
        });
      }
    }

    // 2. Uncategorized Transactions
    const uncategorized = await this.prisma.transaction.count({
      where: { user_id: userId, category_id: null, type: 'EXPENSE' }
    });

    if (uncategorized > 0) {
      insights.push({
        id: randomUUID(),
        type: 'SUGGESTION',
        title: 'Transacciones sin categorizar',
        description: `Tienes ${uncategorized} transacciones sin categorizar. Categorizarlas mejorará tus reportes.`,
        action_label: 'Categorizar ahora',
        action_url: `/transactions?status=uncategorized`,
        created_at: now.toISOString(),
      });
    }

    // 3. Goal achievements
    const goals = await this.prisma.goal.findMany({
      where: { user_id: userId }
    });

    for (const goal of goals) {
      if (goal.current_amount >= goal.target_amount) {
        insights.push({
          id: randomUUID(),
          type: 'SUCCESS',
          title: '¡Meta alcanzada!',
          description: `Has alcanzado tu meta: ${goal.name}. ¡Felicidades!`,
          action_label: 'Ver metas',
          action_url: `/goals`,
          created_at: now.toISOString(),
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        id: randomUUID(),
        type: 'INFO',
        title: 'Todo en orden',
        description: 'Tus finanzas se ven saludables este mes. Sigue así.',
        created_at: now.toISOString(),
      });
    }

    // Limit to top 5 insights for now
    return insights.slice(0, 5);
  }

  async getHealthScore(userId: string): Promise<FinancialHealthScoreDto> {
    // 1. Budget Adherence (max 40 pts)
    const budgets = await this.prisma.budget.findMany({
      where: { user_id: userId, status: 'ACTIVE' }
    });
    
    let budgetAdherence = 0;
    if (budgets.length > 0) {
      const overspent = budgets.filter(b => Number(b.executed_amount) > Number(b.amount)).length;
      budgetAdherence = 40 * (1 - (overspent / budgets.length));
    } else {
      budgetAdherence = 20; // Default if no budgets
    }

    // 2. Savings Rate (max 35 pts)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const txs = await this.prisma.transaction.findMany({
      where: { user_id: userId, date: { gte: currentMonthStart, lte: currentMonthEnd } }
    });
    
    let income = 0;
    let expense = 0;
    txs.forEach(tx => {
      if (tx.type === 'INCOME') income += Number(tx.amount);
      if (tx.type === 'EXPENSE') expense += Number(tx.amount);
    });
    
    let savingsRate = 0;
    if (income > 0) {
      const rate = (income - expense) / income;
      savingsRate = rate > 0.2 ? 35 : rate > 0 ? (rate / 0.2) * 35 : 0;
    } else {
      savingsRate = expense === 0 ? 35 : 0;
    }

    // 3. Goals Progress (max 25 pts)
    const goals = await this.prisma.goal.findMany({
      where: { user_id: userId, status: 'ACTIVE' }
    });
    let goalsProgress = 0;
    if (goals.length > 0) {
      const totalTarget = goals.reduce((acc: number, g: any) => acc + Number(g.target_amount), 0);
      const totalCurrent = goals.reduce((acc: number, g: any) => acc + Number(g.current_amount), 0);
      const progress = totalTarget > 0 ? (totalCurrent / totalTarget) : 0;
      goalsProgress = 25 * Math.min(progress, 1);
    } else {
      goalsProgress = 15;
    }

    const score = Math.round(budgetAdherence + savingsRate + goalsProgress);
    
    let status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'POOR';
    if (score >= 80) status = 'EXCELLENT';
    else if (score >= 60) status = 'GOOD';
    else if (score >= 40) status = 'FAIR';

    return {
      score,
      status,
      metrics: {
        savings_rate: Math.round(savingsRate),
        budget_adherence: Math.round(budgetAdherence),
        goals_progress: Math.round(goalsProgress)
      }
    };
  }
}
