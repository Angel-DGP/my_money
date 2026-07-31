import { Controller, Post, Get, Param, Body, Query, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateGoalUseCase } from '../application/use-cases/create-goal.use-case';
import { GetGoalsUseCase } from '../application/use-cases/get-goals.use-case';
import { GetGoalByIdUseCase } from '../application/use-cases/get-goal-by-id.use-case';
import { AddGoalProgressUseCase } from '../application/use-cases/add-goal-progress.use-case';
import { CreateGoalDto } from './dtos/create-goal.dto';
import { AddGoalProgressDto } from './dtos/add-goal-progress.dto';
import { GoalDto } from './dtos/goal.dto';

@Controller('goals')
export class GoalsController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly getGoalsUseCase: GetGoalsUseCase,
    private readonly getGoalByIdUseCase: GetGoalByIdUseCase,
    private readonly addGoalProgressUseCase: AddGoalProgressUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGoal(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Body() dto: CreateGoalDto,
  ): Promise<GoalDto> {
    return this.createGoalUseCase.execute(req.user.id, dto);
  }

  @Get()
  async getGoals(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Query('status') status?: string,
  ): Promise<GoalDto[]> {
    return this.getGoalsUseCase.execute(req.user.id, status);
  }

  @Get(':id')
  async getGoalById(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<GoalDto> {
    return this.getGoalByIdUseCase.execute(req.user.id, id);
  }

  @Post(':id/add-progress')
  @HttpCode(HttpStatus.OK)
  async addProgress(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddGoalProgressDto,
  ): Promise<GoalDto> {
    return this.addGoalProgressUseCase.execute(req.user.id, id, dto);
  }
}
