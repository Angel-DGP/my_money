import { Module } from '@nestjs/common';
import { InsightsController } from './presentation/insights.controller';
import { GetInsightsUseCase } from './application/use-cases/get-insights.use-case';
import { InsightsService } from './application/services/insights.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsightsController],
  providers: [
    InsightsService,
    GetInsightsUseCase,
  ],
  exports: [InsightsService],
})
export class InsightsModule {}
