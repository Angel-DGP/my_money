import { Injectable } from '@nestjs/common';
import { GetSpendingByCategoryUseCase } from './application/use-cases/get-spending-by-category.use-case';
import { GetCashFlowUseCase } from './application/use-cases/get-cash-flow.use-case';
import { AnalyticsResponseDto } from './dtos/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly getSpendingByCategoryUseCase: GetSpendingByCategoryUseCase,
    private readonly getCashFlowUseCase: GetCashFlowUseCase,
  ) {}

  async getAnalytics(userId: string): Promise<AnalyticsResponseDto> {
    const [spending_by_category, cash_flow] = await Promise.all([
      this.getSpendingByCategoryUseCase.execute(userId),
      this.getCashFlowUseCase.execute(userId),
    ]);

    return {
      spending_by_category,
      cash_flow,
    };
  }
}
