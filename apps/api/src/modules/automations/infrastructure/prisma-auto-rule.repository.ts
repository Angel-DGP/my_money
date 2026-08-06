import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AutoRule, TriggerType, ActionType } from '../domain/auto-rule.entity';
import { IAutoRuleRepository } from '../domain/auto-rule.repository.interface';

@Injectable()
export class PrismaAutoRuleRepository implements IAutoRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(rule: AutoRule): Promise<void> {
    await this.prisma.autoRule.upsert({
      where: { id: rule.id },
      update: {
        name: rule.name,
        description: rule.description,
        trigger_type: rule.triggerType,
        conditions: rule.conditions ?? undefined,
        action_type: rule.actionType,
        action_params: rule.actionParams,
        is_active: rule.isActive,
        updated_at: rule.updatedAt,
      },
      create: {
        id: rule.id,
        user_id: rule.userId,
        name: rule.name,
        description: rule.description,
        trigger_type: rule.triggerType,
        conditions: rule.conditions ?? undefined,
        action_type: rule.actionType,
        action_params: rule.actionParams,
        is_active: rule.isActive,
        created_at: rule.createdAt,
        updated_at: rule.updatedAt,
      },
    });
  }

  async findById(id: string, userId: string): Promise<AutoRule | null> {
    const data = await this.prisma.autoRule.findFirst({
      where: { id, user_id: userId },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findAllByUser(userId: string): Promise<AutoRule[]> {
    const data = await this.prisma.autoRule.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return data.map(this.toDomain);
  }

  async findActiveByUser(userId: string): Promise<AutoRule[]> {
    const data = await this.prisma.autoRule.findMany({
      where: { user_id: userId, is_active: true },
      orderBy: { created_at: 'desc' },
    });
    return data.map(this.toDomain);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.autoRule.deleteMany({
      where: { id, user_id: userId },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(data: any): AutoRule {
    return AutoRule.reconstitute({
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description ?? undefined,
      triggerType: data.trigger_type as TriggerType,
      conditions: data.conditions ? (data.conditions as Record<string, any>) : undefined,
      actionType: data.action_type as ActionType,
      actionParams: data.action_params as Record<string, any>,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}
