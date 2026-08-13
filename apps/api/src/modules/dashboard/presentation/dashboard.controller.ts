import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { GetDashboardSummaryUseCase } from '../application/use-cases/get-dashboard-summary.use-case';
import { GetMonthlyFlowUseCase } from '../application/use-cases/get-monthly-flow.use-case';
import { DashboardSummaryDto } from '../application/dtos/dashboard-summary.dto';
import { MonthlyFlowResponseDto } from '../application/dtos/monthly-flow.dto';
import { ApiResponse } from '@mymoney/shared';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getMonthlyFlowUseCase: GetMonthlyFlowUseCase,
  ) {}

  @Get('summary')
  async getSummary(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<DashboardSummaryDto>> {
    const data = await this.getDashboardSummaryUseCase.execute(req.user.id);
    return { data };
  }

  @Get('monthly-flow')
  async getMonthlyFlow(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<MonthlyFlowResponseDto>> {
    const data = await this.getMonthlyFlowUseCase.execute(req.user.id);
    return { data };
  }
}
