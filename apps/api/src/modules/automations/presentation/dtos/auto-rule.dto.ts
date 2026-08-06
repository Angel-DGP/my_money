import { AutoRule, TriggerType, ActionType } from '../../domain/auto-rule.entity';

export class AutoRuleDto {
  id!: string;
  name!: string;
  description?: string;
  trigger_type!: TriggerType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: Record<string, any>;
  action_type!: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_params!: Record<string, any>;
  is_active!: boolean;
  created_at!: string;
  updated_at!: string;

  static fromDomain(rule: AutoRule): AutoRuleDto {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      trigger_type: rule.triggerType,
      conditions: rule.conditions,
      action_type: rule.actionType,
      action_params: rule.actionParams,
      is_active: rule.isActive,
      created_at: rule.createdAt.toISOString(),
      updated_at: rule.updatedAt.toISOString(),
    };
  }
}
