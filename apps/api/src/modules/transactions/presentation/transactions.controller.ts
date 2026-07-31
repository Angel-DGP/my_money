import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateTransactionDto, UpdateTransactionDto } from '../presentation/dtos/create-transaction.dto';
import { TransactionDto, TransactionPaginatedResponseDto } from '../presentation/dtos/transaction.dto';
import { CreateTransactionUseCase } from '../application/use-cases/create-transaction.use-case';
import { UpdateTransactionUseCase } from '../application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from '../application/use-cases/list-transactions.use-case';
import { SessionGuard } from '../../../auth/session.guard';

@UseGuards(SessionGuard)
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase
  ) {}

  @Get()
  async findAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('account_id') accountId?: string,
    @Query('category_id') categoryId?: string,
    @Query('type') type?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ): Promise<TransactionPaginatedResponseDto> {
    const userId = req.user.id;
    const filters = {
      account_id: accountId,
      category_id: categoryId,
      type,
      start_date: startDate,
      end_date: endDate,
    };
    return this.listTransactionsUseCase.execute(userId, filters, page, limit);
  }

  @Post()
  async create(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Body() dto: CreateTransactionDto
  ): Promise<{ data: TransactionDto }> {
    const userId = req.user.id;
    const data = await this.createTransactionUseCase.execute(userId, dto);
    return { data };
  }

  @Patch(':id')
  async update(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto
  ): Promise<{ data: TransactionDto }> {
    const userId = req.user.id;
    const data = await this.updateTransactionUseCase.execute(id, userId, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') id: string
  ): Promise<void> {
    const userId = req.user.id;
    await this.deleteTransactionUseCase.execute(id, userId);
  }
}

