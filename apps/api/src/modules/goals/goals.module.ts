import { Module } from '@nestjs/common';
import { GoalsController } from './presentation/goals.controller';
import { CreateGoalUseCase } from './application/use-cases/create-goal.use-case';
import { GetGoalsUseCase } from './application/use-cases/get-goals.use-case';
import { GetGoalByIdUseCase } from './application/use-cases/get-goal-by-id.use-case';
import { AddGoalProgressUseCase } from './application/use-cases/add-goal-progress.use-case';
import { GOAL_REPOSITORY } from './domain/goal.repository.interface';
import { PrismaGoalRepository } from './infrastructure/prisma-goal.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoalsController],
  providers: [
    CreateGoalUseCase,
    GetGoalsUseCase,
    GetGoalByIdUseCase,
    AddGoalProgressUseCase,
    {
      provide: GOAL_REPOSITORY,
      useClass: PrismaGoalRepository,
    },
  ],
  exports: [GOAL_REPOSITORY],
})
export class GoalsModule {}
