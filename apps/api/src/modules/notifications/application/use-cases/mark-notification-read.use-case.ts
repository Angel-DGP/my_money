import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repository: INotificationRepository,
  ) {}

  async execute(userId: string, notificationId: string): Promise<void> {
    const notification = await this.repository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Cannot modify this notification');
    }

    if (!notification.isRead()) {
      await this.repository.markAsRead(notificationId);
    }
  }
}
