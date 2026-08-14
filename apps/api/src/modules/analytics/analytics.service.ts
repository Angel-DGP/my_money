import { Injectable } from '@nestjs/common';
import { GetSpendingByCategoryUseCase } from './application/use-cases/get-spending-by-category.use-case';
import { GetCashFlowUseCase } from './application/use-cases/get-cash-flow.use-case';
import { GetAnalyticsSummaryUseCase } from './application/use-cases/get-analytics-summary.use-case';
import { GetFinancialInsightsUseCase } from './application/use-cases/get-financial-insights.use-case';
import { AnalyticsResponseDto } from './dtos/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly getSpendingByCategoryUseCase: GetSpendingByCategoryUseCase,
    private readonly getCashFlowUseCase: GetCashFlowUseCase,
    private readonly getAnalyticsSummaryUseCase: GetAnalyticsSummaryUseCase,
    private readonly getFinancialInsightsUseCase: GetFinancialInsightsUseCase,
  ) {}

  async getAnalytics(userId: string, months: number = 1): Promise<AnalyticsResponseDto> {
    const validMonths = Math.min(Math.max(Number(months) || 1, 1), 24);
    const now = new Date();

    let currentStart: Date;
    let currentEnd: Date;
    let prevStart: Date;
    let prevEnd: Date;

    if (validMonths === 1) {
      // Current calendar month
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Previous calendar month
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else {
      // Last N months (from 1st of (now - N + 1) month to end of current month)
      currentStart = new Date(now.getFullYear(), now.getMonth() - (validMonths - 1), 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Previous equivalent period of N months
      prevStart = new Date(now.getFullYear(), now.getMonth() - (2 * validMonths - 1), 1, 0, 0, 0, 0);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - (validMonths - 1), 0, 23, 59, 59, 999);
    }

    const cashFlowMonths = Math.max(6, validMonths);

    const [summary, spending_by_category, cash_flow] = await Promise.all([
      this.getAnalyticsSummaryUseCase.execute(userId, currentStart, currentEnd, prevStart, prevEnd),
      this.getSpendingByCategoryUseCase.execute(userId, currentStart, currentEnd),
      this.getCashFlowUseCase.execute(userId, cashFlowMonths),
    ]);

    const { top_expenses, insights } = await this.getFinancialInsightsUseCase.execute(
      userId,
      currentStart,
      currentEnd,
      summary
    );

    return {
      summary,
      spending_by_category,
      cash_flow,
      top_expenses,
      insights,
      period_months: validMonths,
    };
  }
}
