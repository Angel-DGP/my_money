import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import { NotificationDto } from '../dtos/notification.dto';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<{ items: NotificationDto[], unread_count: number }> {
    const notifications = await this.repository.findByUserId(userId, 50);
    const unread_count = await this.repository.countUnread(userId);

    const items = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      entity_type: n.entity_type,
      entity_id: n.entity_id,
      action_url: n.action_url,
      read_at: n.read_at?.toISOString() ?? null,
      created_at: n.created_at.toISOString(),
    }));

    return { items, unread_count };
  }
}
