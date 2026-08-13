import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateGoalUseCase } from '../application/use-cases/create-goal.use-case';
import { GetGoalsUseCase } from '../application/use-cases/get-goals.use-case';
import { GetGoalByIdUseCase } from '../application/use-cases/get-goal-by-id.use-case';
import { AddGoalProgressUseCase } from '../application/use-cases/add-goal-progress.use-case';
import { UpdateGoalUseCase } from '../application/use-cases/update-goal.use-case';
import { DeleteGoalUseCase } from '../application/use-cases/delete-goal.use-case';
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { AddGoalProgressDto } from './dtos/add-goal-progress.dto';
import { GoalDto } from './dtos/goal.dto';
import { ApiResponse } from '@mymoney/shared';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

/**
 * Controller para gestión de metas financieras del usuario.
 *
 * Todos los endpoints requieren autenticación JWT y operan
 * exclusivamente sobre los datos del usuario autenticado.
 */
@UseGuards(JwtAuthGuard)
@Controller({ path: 'goals', version: '1' })
export class GoalsController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly getGoalsUseCase: GetGoalsUseCase,
    private readonly getGoalByIdUseCase: GetGoalByIdUseCase,
    private readonly addGoalProgressUseCase: AddGoalProgressUseCase,
    private readonly updateGoalUseCase: UpdateGoalUseCase,
    private readonly deleteGoalUseCase: DeleteGoalUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGoal(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateGoalDto,
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.createGoalUseCase.execute(req.user.id, dto);
    return { data };
  }

  @Get()
  async getGoals(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
  ): Promise<ApiResponse<GoalDto[]>> {
    const data = await this.getGoalsUseCase.execute(req.user.id, status);
    return { data };
  }

  @Get(':id')
  async getGoalById(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.getGoalByIdUseCase.execute(req.user.id, id);
    return { data };
  }

  @Patch(':id')
  async updateGoal(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.updateGoalUseCase.execute(req.user.id, id, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGoal(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteGoalUseCase.execute(req.user.id, id);
  }

  @Post(':id/add-progress')
  @HttpCode(HttpStatus.OK)
  async addProgress(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddGoalProgressDto,
  ): Promise<ApiResponse<GoalDto>> {
    const data = await this.addGoalProgressUseCase.execute(req.user.id, id, dto);
    return { data };
  }
}
