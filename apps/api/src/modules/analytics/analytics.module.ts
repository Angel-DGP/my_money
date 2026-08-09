import { Module } from '@nestjs/common';
import { AnalyticsController } from './infrastructure/http/analytics.controller';
import { AnalyticsService } from './analytics.service';
import { GetSpendingByCategoryUseCase } from './application/use-cases/get-spending-by-category.use-case';
import { GetCashFlowUseCase } from './application/use-cases/get-cash-flow.use-case';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    GetSpendingByCategoryUseCase,
    GetCashFlowUseCase,
  ],
})
export class AnalyticsModule {}
