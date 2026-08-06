import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { GetDashboardSummaryUseCase } from '../application/use-cases/get-dashboard-summary.use-case';
import { GetMonthlyFlowUseCase } from '../application/use-cases/get-monthly-flow.use-case';
import { DashboardSummaryDto } from '../application/dtos/dashboard-summary.dto';
import { MonthlyFlowResponseDto } from '../application/dtos/monthly-flow.dto';
import { ApiResponse } from '@mymoney/shared';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getMonthlyFlowUseCase: GetMonthlyFlowUseCase,
  ) {}

  @Get('summary')
  async getSummary(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
  ): Promise<ApiResponse<DashboardSummaryDto>> {
    const data = await this.getDashboardSummaryUseCase.execute(req.user.id);
    return { data };
  }

  @Get('monthly-flow')
  async getMonthlyFlow(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
  ): Promise<ApiResponse<MonthlyFlowResponseDto>> {
    const data = await this.getMonthlyFlowUseCase.execute(req.user.id);
    return { data };
  }
}
