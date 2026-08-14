import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from '../../analytics.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AnalyticsResponseDto } from '../../dtos/analytics.dto';
import { AuthenticatedRequest } from '../../../../common/interfaces/authenticated-request.interface';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(
    @Req() req: AuthenticatedRequest,
    @Query('months') months?: string
  ): Promise<AnalyticsResponseDto> {
    const userId = req.user.id;
    const monthsNum = months ? parseInt(months, 10) : 1;
    return this.analyticsService.getAnalytics(userId, monthsNum);
  }
}
