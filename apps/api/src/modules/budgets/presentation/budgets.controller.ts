import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { Controller, Get, Post, Patch,  Param, Body, Query,  Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateBudgetUseCase } from '../application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../application/use-cases/get-budgets.use-case';
import { UpdateBudgetUseCase } from '../application/use-cases/update-budget.use-case';
import { DeactivateBudgetUseCase } from '../application/use-cases/deactivate-budget.use-case';
import { GetBudgetByIdUseCase } from '../application/use-cases/get-budget-by-id.use-case';
import { ReactivateBudgetUseCase } from '../application/use-cases/reactivate-budget.use-case';
import { CreateBudgetDto } from './dtos/create-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { BudgetDto } from './dtos/budget.dto';
import { ApiResponse } from '@mymoney/shared';

import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller({ path: 'budgets', version: '1' })
export class BudgetsController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly deactivateBudgetUseCase: DeactivateBudgetUseCase,
    private readonly getBudgetByIdUseCase: GetBudgetByIdUseCase,
    private readonly reactivateBudgetUseCase: ReactivateBudgetUseCase
  ) {}

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('category_id') categoryId?: string
  ): Promise<ApiResponse<BudgetDto[]>> {
    const data = await this.getBudgetsUseCase.findAll(req.user.id, status, categoryId);
    return { data };
  }

  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string): Promise<ApiResponse<BudgetDto>> {
    const data = await this.getBudgetByIdUseCase.execute(req.user.id, id);
    return { data };
  }

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateBudgetDto): Promise<ApiResponse<BudgetDto>> {
    const data = await this.createBudgetUseCase.execute(req.user.id, dto);
    return { data };
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto
  ): Promise<ApiResponse<BudgetDto>> {
    const data = await this.updateBudgetUseCase.execute(req.user.id, id, dto);
    return { data };
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deactivate(@Request() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await this.deactivateBudgetUseCase.execute(req.user.id, id);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async reactivate(@Request() req: AuthenticatedRequest, @Param('id') id: string): Promise<ApiResponse<BudgetDto>> {
    const data = await this.reactivateBudgetUseCase.execute(req.user.id, id);
    return { data };
  }
}
