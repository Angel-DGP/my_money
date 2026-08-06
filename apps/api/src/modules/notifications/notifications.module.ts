import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsController } from './presentation/notifications.controller';
import { ListNotificationsUseCase } from './application/use-cases/list-notifications.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { PrismaNotificationRepository } from './infrastructure/prisma/prisma-notification.repository';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    ListNotificationsUseCase,
    MarkNotificationReadUseCase,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationsModule {}
