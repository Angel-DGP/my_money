import { Controller, Get, Post, Patch,  Param, Body, Query,  Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateBudgetUseCase } from '../application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../application/use-cases/get-budgets.use-case';
import { UpdateBudgetUseCase } from '../application/use-cases/update-budget.use-case';
import { DeactivateBudgetUseCase } from '../application/use-cases/deactivate-budget.use-case';
import { GetBudgetByIdUseCase } from '../application/use-cases/get-budget-by-id.use-case';
import { ReactivateBudgetUseCase } from '../application/use-cases/reactivate-budget.use-case';
import { CreateBudgetDto } from './dtos/create-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { BudgetDto } from './dtos/budget.dto';

// Usamos @UseGuards(...) si la app ya tiene guardias definidos, asumiendo JwtAuthGuard global o SessionGuard
// @UseGuards(SessionGuard)
@Controller('budgets')
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Query('status') status?: string,
    @Query('category_id') categoryId?: string
  ): Promise<{ data: BudgetDto[] }> {
    const data = await this.getBudgetsUseCase.findAll(req.user.id, status, categoryId);
    return { data };
  }

  @Get(':id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(@Request() req: any, @Param('id') id: string): Promise<BudgetDto> {
    return this.getBudgetByIdUseCase.execute(req.user.id, id);
  }

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(@Request() req: any, @Body() dto: CreateBudgetDto): Promise<BudgetDto> {
    return this.createBudgetUseCase.execute(req.user.id, dto);
  }

  @Patch(':id')
  async update(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto
  ): Promise<BudgetDto> {
    return this.updateBudgetUseCase.execute(req.user.id, id, dto);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deactivate(@Request() req: any, @Param('id') id: string): Promise<void> {
    await this.deactivateBudgetUseCase.execute(req.user.id, id);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async reactivate(@Request() req: any, @Param('id') id: string): Promise<BudgetDto> {
    return this.reactivateBudgetUseCase.execute(req.user.id, id);
  }
}
