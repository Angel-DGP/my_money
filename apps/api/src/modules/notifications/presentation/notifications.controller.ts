import { Controller, Get, Patch, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { ListNotificationsUseCase } from '../application/use-cases/list-notifications.use-case';
import { MarkNotificationReadUseCase } from '../application/use-cases/mark-notification-read.use-case';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
  ) {}

  @Get()
  async list(@Request() req: any) {
    const data = await this.listNotificationsUseCase.execute(req.user.id);
    return { data };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.markNotificationReadUseCase.execute(req.user.id, id);
  }
}
