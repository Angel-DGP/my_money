import { Module } from '@nestjs/common';
import { DashboardController } from './presentation/dashboard.controller';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.use-case';
import { GetMonthlyFlowUseCase } from './application/use-cases/get-monthly-flow.use-case';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    GetDashboardSummaryUseCase,
    GetMonthlyFlowUseCase,
  ],
})
export class DashboardModule {}
