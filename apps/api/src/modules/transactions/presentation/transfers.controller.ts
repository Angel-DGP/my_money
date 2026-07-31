import { Controller, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateTransferDto } from '../presentation/dtos/create-transaction.dto';
import { TransferPairDto } from '../presentation/dtos/transaction.dto';
import { CreateTransferUseCase } from '../application/use-cases/create-transfer.use-case';
import { DeleteTransferUseCase } from '../application/use-cases/delete-transfer.use-case';
import { SessionGuard } from '../../../auth/session.guard';

@UseGuards(SessionGuard)
@Controller({ path: 'transfers', version: '1' })
export class TransfersController {
  constructor(
    private readonly createTransferUseCase: CreateTransferUseCase,
    private readonly deleteTransferUseCase: DeleteTransferUseCase
  ) {}

  @Post()
  async create(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Body() dto: CreateTransferDto
  ): Promise<{ data: TransferPairDto }> {
    const userId = req.user.id;
    const data = await this.createTransferUseCase.execute(userId, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Request() req: any,
    @Param('id') pairId: string
  ): Promise<void> {
    const userId = req.user.id;
    await this.deleteTransferUseCase.execute(pairId, userId);
  }
}
