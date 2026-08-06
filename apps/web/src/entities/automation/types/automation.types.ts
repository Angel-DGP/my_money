export type TriggerType = 'INCOME_RECEIVED' | 'BUDGET_THRESHOLD' | 'MONTH_END' | 'CUSTOM';
export const TriggerType = {
  INCOME_RECEIVED: 'INCOME_RECEIVED' as TriggerType,
  BUDGET_THRESHOLD: 'BUDGET_THRESHOLD' as TriggerType,
  MONTH_END: 'MONTH_END' as TriggerType,
  CUSTOM: 'CUSTOM' as TriggerType,
};

export type ActionType = 'MOVE_TO_GOAL' | 'RESERVE_AMOUNT' | 'ALERT_USER';
export const ActionType = {
  MOVE_TO_GOAL: 'MOVE_TO_GOAL' as ActionType,
  RESERVE_AMOUNT: 'RESERVE_AMOUNT' as ActionType,
  ALERT_USER: 'ALERT_USER' as ActionType,
};

export interface AutoRuleDto {
  id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: Record<string, any>;
  action_type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_params: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAutoRuleDto {
  name: string;
  description?: string;
  trigger_type: TriggerType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: Record<string, any>;
  action_type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_params: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateAutoRuleDto extends Partial<CreateAutoRuleDto> {}
