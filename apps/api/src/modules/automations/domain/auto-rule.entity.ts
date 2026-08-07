import { DomainEvent } from '@mymoney/shared';
import { randomUUID } from 'crypto';

export enum TriggerType {
  INCOME_RECEIVED = 'INCOME_RECEIVED',
  BUDGET_THRESHOLD = 'BUDGET_THRESHOLD',
  MONTH_END = 'MONTH_END',
  CUSTOM = 'CUSTOM',
}

export enum ActionType {
  MOVE_TO_GOAL = 'MOVE_TO_GOAL',
  RESERVE_AMOUNT = 'RESERVE_AMOUNT',
  ALERT_USER = 'ALERT_USER',
}

export interface CreateAutoRuleProps {
  userId: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: Record<string, any>;
  actionType: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionParams: Record<string, any>;
  isActive?: boolean;
}

export interface AutoRuleProps extends CreateAutoRuleProps {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AutoRule {
  private props: AutoRuleProps;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: AutoRuleProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get triggerType(): TriggerType { return this.props.triggerType; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get conditions(): Record<string, any> | undefined { return this.props.conditions; }
  get actionType(): ActionType { return this.props.actionType; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get actionParams(): Record<string, any> { return this.props.actionParams; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Events
  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  static create(props: CreateAutoRuleProps): AutoRule {
    return new AutoRule({
      id: randomUUID(),
      userId: props.userId,
      name: props.name,
      description: props.description,
      triggerType: props.triggerType,
      conditions: props.conditions,
      actionType: props.actionType,
      actionParams: props.actionParams,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: AutoRuleProps): AutoRule {
    return new AutoRule(props);
  }

  public update(props: Partial<Omit<CreateAutoRuleProps, 'userId'>>): void {
    if (props.name !== undefined) this.props.name = props.name;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.triggerType !== undefined) this.props.triggerType = props.triggerType;
    if (props.conditions !== undefined) this.props.conditions = props.conditions;
    if (props.actionType !== undefined) this.props.actionType = props.actionType;
    if (props.actionParams !== undefined) this.props.actionParams = props.actionParams;
    
    this.props.updatedAt = new Date();
  }

  public toggle(isActive: boolean): void {
    this.props.isActive = isActive;
    this.props.updatedAt = new Date();
  }
}
