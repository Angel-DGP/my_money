import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from '../../analytics.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AnalyticsResponseDto } from '../../dtos/analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(@Request() req: any): Promise<AnalyticsResponseDto> {
    const userId = req.user.id;
    return this.analyticsService.getAnalytics(userId);
  }
}
