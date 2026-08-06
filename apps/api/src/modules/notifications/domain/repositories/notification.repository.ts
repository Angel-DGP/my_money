import { NotificationEntity } from '../entities/notification.entity';

export interface INotificationRepository {
  create(notification: NotificationEntity): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  findByUserId(userId: string, limit?: number): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
