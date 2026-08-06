import { Controller, Post, Get, Param, Body, Query, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateGoalUseCase } from '../application/use-cases/create-goal.use-case';
import { GetGoalsUseCase } from '../application/use-cases/get-goals.use-case';
import { GetGoalByIdUseCase } from '../application/use-cases/get-goal-by-id.use-case';
import { AddGoalProgressUseCase } from '../application/use-cases/add-goal-progress.use-case';
import { CreateGoalDto } from './dtos/create-goal.dto';
import { AddGoalProgressDto } from './dtos/add-goal-progress.dto';
import { GoalDto } from './dtos/goal.dto';
import { ApiResponse } from '@mymoney/shared';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.createGoalUseCase.execute(req.user.id, dto);
    return { data };
  }

  @Get()
  async getGoals(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Query('status') status?: string,
  ): Promise<ApiResponse<GoalDto[]>> {
    const data = await this.getGoalsUseCase.execute(req.user.id, status);
    return { data };
  }

  @Get(':id')
  async getGoalById(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.getGoalByIdUseCase.execute(req.user.id, id);
    return { data };
  }

  @Post(':id/add-progress')
  @HttpCode(HttpStatus.OK)
  async addProgress(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddGoalProgressDto,
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.addGoalProgressUseCase.execute(req.user.id, id, dto);
    return { data };
  }
}
