import { AutoRule } from './auto-rule.entity';

export const AUTO_RULE_REPOSITORY = 'AUTO_RULE_REPOSITORY';

export interface IAutoRuleRepository {
  save(rule: AutoRule): Promise<void>;
  findById(id: string, userId: string): Promise<AutoRule | null>;
  findAllByUser(userId: string): Promise<AutoRule[]>;
  findActiveByUser(userId: string): Promise<AutoRule[]>;
  delete(id: string, userId: string): Promise<void>;
}
