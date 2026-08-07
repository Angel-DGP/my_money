import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { CreateAutoRuleUseCase } from '../application/use-cases/create-auto-rule.use-case';
import { UpdateAutoRuleUseCase } from '../application/use-cases/update-auto-rule.use-case';
import { GetAutoRulesUseCase } from '../application/use-cases/get-auto-rules.use-case';
import { DeleteAutoRuleUseCase } from '../application/use-cases/delete-auto-rule.use-case';
import { CreateAutoRuleDto } from './dtos/create-auto-rule.dto';
import { UpdateAutoRuleDto } from './dtos/update-auto-rule.dto';
import { AutoRuleDto } from './dtos/auto-rule.dto';
import { ApiResponse as CustomApiResponse } from '@mymoney/shared';

@Controller('automations')
@UseGuards(JwtAuthGuard)
export class AutomationsController {
  constructor(
    private readonly createAutoRuleUseCase: CreateAutoRuleUseCase,
    private readonly updateAutoRuleUseCase: UpdateAutoRuleUseCase,
    private readonly getUseCase: GetAutoRulesUseCase,
    private readonly deleteAutoRuleUseCase: DeleteAutoRuleUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateAutoRuleDto,
    @Request() req: AuthenticatedRequest
  ): Promise<CustomApiResponse<AutoRuleDto>> {
    const userId = req.user.id;
    const rule = await this.createAutoRuleUseCase.execute(userId, dto);
    return { data: rule };
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('activeOnly') activeOnly?: string,
  ): Promise<CustomApiResponse<AutoRuleDto[]>> {
    const userId = req.user.id;
    const data = await this.getUseCase.execute(userId, activeOnly === 'true');
    return { data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAutoRuleDto,
    @Request() req: AuthenticatedRequest
  ): Promise<CustomApiResponse<AutoRuleDto>> {
    const userId = req.user.id;
    const rule = await this.updateAutoRuleUseCase.execute(userId, id, dto);
    return { data: rule };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<{ success: boolean }> {
    const userId = req.user.id;
    await this.deleteAutoRuleUseCase.execute(userId, id);
    return { success: true };
  }
}
