import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { Notification as PrismaNotification } from '@mymoney/db';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(model: PrismaNotification): NotificationEntity {
    return new NotificationEntity({
      id: model.id,
      user_id: model.user_id,
      type: model.type as NotificationEntity['type'],
      title: model.title,
      body: model.body,
      entity_type: model.entity_type,
      entity_id: model.entity_id,
      action_url: model.action_url,
      read_at: model.read_at,
      created_at: model.created_at,
    });
  }

  async create(entity: NotificationEntity): Promise<NotificationEntity> {
    const model = await this.prisma.notification.create({
      data: {
        user_id: entity.user_id,
        type: entity.type,
        title: entity.title,
        body: entity.body,
        entity_type: entity.entity_type,
        entity_id: entity.entity_id,
        action_url: entity.action_url,
      },
    });
    return this.mapToEntity(model);
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const model = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!model) return null;
    return this.mapToEntity(model);
  }

  async findByUserId(userId: string, limit: number = 20): Promise<NotificationEntity[]> {
    const models = await this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return models.map(this.mapToEntity.bind(this));
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: { read_at: new Date() },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        user_id: userId,
        read_at: null,
      },
    });
  }
}
