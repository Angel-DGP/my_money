import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { GetInsightsUseCase } from '../application/use-cases/get-insights.use-case';
import { InsightsService } from '../application/services/insights.service';
import { InsightDto } from '../application/dtos/insight.dto';
import { ApiResponse } from '@mymoney/shared';

@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(
    private readonly getInsightsUseCase: GetInsightsUseCase,
    private readonly insightsService: InsightsService
  ) {}

  @Get()
  async getInsights(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
  ): Promise<ApiResponse<InsightDto[]>> {
    const data = await this.getInsightsUseCase.execute(req.user.id);
    return { data };
  }

  @Get('health-score')
  async getHealthScore(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
  ): Promise<ApiResponse<any>> {
    const data = await this.insightsService.getHealthScore(req.user.id);
    return { data };
  }
}
