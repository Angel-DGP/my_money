import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { CashflowService } from './cashflow.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { GetProjectionsQueryDto } from './dto/get-projections.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateSalaryEventDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

class UpdateCashflowEventStatusDto {
  @IsString()
  status!: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

class PayCashflowEventDto {
  @IsString()
  accountId!: string;

  @IsOptional()
  @IsString()
  date?: string;
}

@Controller({ path: 'cashflow', version: '1' })
@UseGuards(JwtAuthGuard)
export class CashflowController {
  constructor(private readonly cashflowService: CashflowService) {}

  @Get('projections')
  getProjections(@Req() req: AuthenticatedRequest, @Query() query: GetProjectionsQueryDto) {
    return this.cashflowService.getProjections(req.user.id, query);
  }

  @Post('salaries')
  registerSalary(@Req() req: AuthenticatedRequest, @Body() dto: CreateSalaryDto) {
    return this.cashflowService.registerSalary(req.user.id, dto);
  }

  @Get('salaries')
  listSalaries(@Req() req: AuthenticatedRequest) {
    return this.cashflowService.listSalaries(req.user.id);
  }

  @Patch('salaries/:id')
  updateSalary(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSalaryEventDto,
  ) {
    return this.cashflowService.updateSalaryEvent(req.user.id, id, dto);
  }

  @Delete('salaries/:id')
  deleteSalary(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.cashflowService.deleteSalaryEvent(req.user.id, id);
  }

  @Patch('events/:id/status')
  updateEventStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCashflowEventStatusDto,
  ) {
    return this.cashflowService.updateEventStatus(req.user.id, id, dto.status);
  }

  @Post('events/:id/pay')
  payEvent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: PayCashflowEventDto,
  ) {
    return this.cashflowService.payEvent(req.user.id, id, dto);
  }

  @Post('events/:id/unpay')
  unpayEvent(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.cashflowService.unpayEvent(req.user.id, id);
  }
}
