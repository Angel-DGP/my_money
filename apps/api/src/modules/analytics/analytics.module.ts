import { Module } from '@nestjs/common';
import { AnalyticsController } from './infrastructure/http/analytics.controller';
import { AnalyticsService } from './analytics.service';
import { GetSpendingByCategoryUseCase } from './application/use-cases/get-spending-by-category.use-case';
import { GetCashFlowUseCase } from './application/use-cases/get-cash-flow.use-case';
import { GetAnalyticsSummaryUseCase } from './application/use-cases/get-analytics-summary.use-case';
import { GetFinancialInsightsUseCase } from './application/use-cases/get-financial-insights.use-case';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    GetSpendingByCategoryUseCase,
    GetCashFlowUseCase,
    GetAnalyticsSummaryUseCase,
    GetFinancialInsightsUseCase,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
