import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { GetInsightsUseCase } from '../application/use-cases/get-insights.use-case';
import { InsightsService } from '../application/services/insights.service';
import { InsightDto } from '../application/dtos/insight.dto';
import { ApiResponse } from '@mymoney/shared';
import { FinancialHealthScoreDto } from '../application/dtos/health-score.dto';

@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(
    private readonly getInsightsUseCase: GetInsightsUseCase,
    private readonly insightsService: InsightsService
  ) {}

  @Get()
  async getInsights(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<InsightDto[]>> {
    const data = await this.getInsightsUseCase.execute(req.user.id);
    return { data };
  }

  @Get('health-score')
  async getHealthScore(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<FinancialHealthScoreDto>> {
    const data = await this.insightsService.getHealthScore(req.user.id);
    return { data };
  }
}
