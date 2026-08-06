import { Injectable } from '@nestjs/common';
import { InsightsService } from '../services/insights.service';
import { InsightDto } from '../dtos/insight.dto';

@Injectable()
export class GetInsightsUseCase {
  constructor(private readonly insightsService: InsightsService) {}

  async execute(userId: string): Promise<InsightDto[]> {
    return this.insightsService.generateInsights(userId);
  }
}
