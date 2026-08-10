import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CashflowService } from './cashflow.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { GetProjectionsQueryDto } from './dto/get-projections.dto';

@Controller('cashflow')
@UseGuards(JwtAuthGuard)
export class CashflowController {
  constructor(private readonly cashflowService: CashflowService) {}

  @Get('projections')
  getProjections(@Req() req: any, @Query() query: GetProjectionsQueryDto) {
    return this.cashflowService.getProjections(req.user.id, query);
  }

  @Post('salaries')
  registerSalary(@Req() req: any, @Body() dto: CreateSalaryDto) {
    return this.cashflowService.registerSalary(req.user.id, dto);
  }
}
