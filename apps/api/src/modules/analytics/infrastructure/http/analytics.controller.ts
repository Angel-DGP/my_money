import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from '../../analytics.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AnalyticsResponseDto } from '../../dtos/analytics.dto';
import { AuthenticatedRequest } from '../../../../common/interfaces/authenticated-request.interface';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Req() req: AuthenticatedRequest): Promise<AnalyticsResponseDto> {
    const userId = req.user.id;
    return this.analyticsService.getAnalytics(userId);
  }
}
