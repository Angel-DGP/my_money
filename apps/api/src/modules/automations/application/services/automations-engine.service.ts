import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTO_RULE_REPOSITORY, IAutoRuleRepository } from '../../domain/auto-rule.repository.interface';
import { TriggerType, ActionType, AutoRule } from '../../domain/auto-rule.entity';

/** Minimal shape of the transaction.created event payload */
interface TransactionEventPayload {
  userId: string;
  transactionId: string;
  amount?: number;
  [key: string]: unknown;
}

@Injectable()
export class AutomationsEngineService {
  private readonly logger = new Logger(AutomationsEngineService.name);

  constructor(
    @Inject(AUTO_RULE_REPOSITORY)
    private readonly autoRuleRepository: IAutoRuleRepository,
  ) {}

  @OnEvent('transaction.created')
  async handleTransactionCreatedEvent(event: TransactionEventPayload) {
    this.logger.log(`Received transaction.created event for user ${event.userId}`);
    await this.processRules(event.userId, TriggerType.INCOME_RECEIVED, event);
  }

  private async processRules(userId: string, triggerType: TriggerType, eventPayload: TransactionEventPayload) {
    const rules = await this.autoRuleRepository.findActiveByUser(userId);
    const applicableRules = rules.filter(r => r.triggerType === triggerType);

    for (const rule of applicableRules) {
      if (this.evaluateConditions(rule, eventPayload)) {
        await this.executeAction(rule, eventPayload);
      }
    }
  }

  private evaluateConditions(rule: AutoRule, payload: TransactionEventPayload): boolean {
    if (!rule.conditions) return true; // No conditions = always execute

    // Basic condition evaluation
    // Example: { "amount": { "$gt": 1000 } }
    try {
      for (const [key, condition] of Object.entries(rule.conditions)) {
        const payloadValue = payload[key];
        
        // simple equality check
        if (typeof condition !== 'object') {
           if (payloadValue !== condition) return false;
           continue;
        }

        // complex check
        if (condition.$eq !== undefined && payloadValue !== condition.$eq) return false;
        if (condition.$ne !== undefined && payloadValue === condition.$ne) return false;
        if (condition.$gt !== undefined && (payloadValue as number) <= (condition.$gt as number)) return false;
        if (condition.$gte !== undefined && (payloadValue as number) < (condition.$gte as number)) return false;
        if (condition.$lt !== undefined && (payloadValue as number) >= (condition.$lt as number)) return false;
        if (condition.$lte !== undefined && (payloadValue as number) > (condition.$lte as number)) return false;
        if (condition.$in !== undefined && Array.isArray(condition.$in) && !condition.$in.includes(payloadValue)) return false;
      }
      return true;
    } catch (e) {
      this.logger.error(`Error evaluating condition for rule ${rule.id}:`, e);
      return false;
    }
  }

  private async executeAction(rule: AutoRule, _payload: TransactionEventPayload) {
    this.logger.log(`Executing action ${rule.actionType} for rule ${rule.id}`);
    
    switch (rule.actionType) {
      case ActionType.MOVE_TO_GOAL:
        // Logic to move amount to goal
        // Needs transaction use case and goal repository
        this.logger.log(`Action MOVE_TO_GOAL: Moving funds based on params ${JSON.stringify(rule.actionParams)}`);
        break;
      case ActionType.RESERVE_AMOUNT:
        this.logger.log(`Action RESERVE_AMOUNT: Reserving funds based on params ${JSON.stringify(rule.actionParams)}`);
        break;
      case ActionType.ALERT_USER:
        this.logger.log(`Action ALERT_USER: Sending alert based on params ${JSON.stringify(rule.actionParams)}`);
        break;
    }
  }
}
