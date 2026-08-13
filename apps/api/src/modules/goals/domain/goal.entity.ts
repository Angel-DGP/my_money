import { DomainEvent } from '@mymoney/shared';
import { randomUUID } from 'crypto';
import { Money } from '@mymoney/shared';
import { GoalStatus } from './goal-status.enum';
import { GoalException } from './exceptions/goal.exceptions';
import { GoalProgressUpdatedEvent } from './events/goal-progress-updated.event';
import { GoalCompletedEvent } from './events/goal-completed.event';

export interface CreateGoalProps {
  userId: string;
  name: string;
  targetAmount: Money;
  targetDate?: Date | null;
  description?: string | null;
  priority?: number;
  color?: string | null;
  icon?: string | null;
  accountId?: string | null;
}

export interface GoalProps {
  id: string;
  userId: string;
  name: string;
  targetAmount: Money;
  currentAmount: Money;
  targetDate: Date | null;
  status: GoalStatus;
  description: string | null;
  priority: number;
  color: string | null;
  icon: string | null;
  accountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}


export class Goal {
  private props: GoalProps;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: GoalProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get name(): string { return this.props.name; }
  get targetAmount(): Money { return this.props.targetAmount; }
  get currentAmount(): Money { return this.props.currentAmount; }
  get targetDate(): Date | null { return this.props.targetDate; }
  get status(): GoalStatus { return this.props.status; }
  get description(): string | null { return this.props.description; }
  get priority(): number { return this.props.priority; }
  get color(): string | null { return this.props.color; }
  get icon(): string | null { return this.props.icon; }
  get accountId(): string | null { return this.props.accountId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get deletedAt(): Date | null { return this.props.deletedAt; }


  // Restituye un Goal existente (ej. desde el repositorio)
  static reconstitute(props: GoalProps): Goal {
    return new Goal(props);
  }

  // Crea un nuevo Goal
  static create(props: CreateGoalProps): Goal {
    if (props.targetAmount.isZero() || props.targetAmount.isNegative()) {
      throw GoalException.targetAmountZeroOrLess();
    }

    if (props.targetDate) {
      // Normalizamos las fechas al inicio del día para la comparación
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(props.targetDate);
      target.setHours(0, 0, 0, 0);
      
      if (target < today) {
        throw GoalException.targetDateInPast();
      }
    }

    const now = new Date();
    
    return new Goal({
      id: randomUUID(),
      userId: props.userId,
      name: props.name,
      targetAmount: props.targetAmount,
      currentAmount: Money.zero(props.targetAmount.currency),
      targetDate: props.targetDate || null,
      status: GoalStatus.ACTIVE,
      description: props.description || null,
      priority: props.priority ?? 3,
      color: props.color || null,
      icon: props.icon || null,
      accountId: props.accountId || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

  }

  // Domain Events
  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  // Comportamiento

  addProgress(amountToAdd: Money, updatedBy: string): void {
    this.assertNotCompleted();
    
    if (this.props.status === GoalStatus.PAUSED) {
      throw GoalException.goalPaused();
    }

    if (amountToAdd.isZero() || amountToAdd.isNegative()) {
      // Ignoramos aportes negativos o nulos
      return;
    }

    // GOL-R03: Limitar al targetAmount si se excede
    const newTotal = this.props.currentAmount.add(amountToAdd);
    
    if (newTotal.isGreaterThan(this.props.targetAmount) || newTotal.equals(this.props.targetAmount)) {
      // Se topa al máximo
      this.props.currentAmount = this.props.targetAmount;
      this.props.status = GoalStatus.COMPLETED;
      this.props.updatedAt = new Date();
      
      this.addDomainEvent(
        new GoalCompletedEvent({
          aggregateId: this.id,
          completedBy: updatedBy,
        })
      );
    } else {
      this.props.currentAmount = newTotal;
      this.props.updatedAt = new Date();
      
      this.addDomainEvent(
        new GoalProgressUpdatedEvent({
          aggregateId: this.id,
          amountAdded: amountToAdd,
          newCurrentAmount: this.props.currentAmount,
          targetAmount: this.props.targetAmount,
          updatedBy,
        })
      );
    }
  }

  /**
   * Actualiza el monto objetivo de la meta.
   * Solo aplicable si la meta no está completada.
   * El nuevo monto no puede ser cero ni negativo.
   */
  updateTargetAmount(newTargetAmount: Money): void {
    this.assertNotCompleted();
    if (newTargetAmount.isZero() || newTargetAmount.isNegative()) {
      throw new Error('Target amount must be greater than zero');
    }
    this.props.targetAmount = newTargetAmount;
    this.props.updatedAt = new Date();
  }

  /**
   * Actualiza los campos editables de la meta.
   * Un goal COMPLETED no puede ser modificado.
   */
  update(props: {
    name?: string;
    targetDate?: Date | null;
    description?: string | null;
    priority?: number;
    color?: string | null;
    icon?: string | null;
    accountId?: string | null;
  }): void {
    this.assertNotCompleted();

    if (props.name !== undefined) this.props.name = props.name;
    if (props.targetDate !== undefined) this.props.targetDate = props.targetDate;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.priority !== undefined) this.props.priority = props.priority;
    if (props.color !== undefined) this.props.color = props.color;
    if (props.icon !== undefined) this.props.icon = props.icon;
    if (props.accountId !== undefined) this.props.accountId = props.accountId;

    this.props.updatedAt = new Date();
  }

  /**
   * Marca la meta como DELETED (soft delete a nivel de dominio).
   * Registra el timestamp de borrado para filtrado en el repositorio.
   */
  markAsDeleted(): void {
    const now = new Date();
    this.props.deletedAt = now;
    this.props.updatedAt = now;
  }

  // Nota: Los métodos `pause()` y `activate()` fueron omitidos de este MVP
  // ya que no están en el contrato de API, pero la inmutabilidad de `COMPLETED` se mantiene.

  private assertNotCompleted(): void {
    if (this.props.status === GoalStatus.COMPLETED) {
      throw GoalException.goalCompletedImmutable();
    }
  }

  progressPercentage(): number {
    if (this.props.targetAmount.isZero()) return 0;
    const current = Number(this.props.currentAmount.value.toString());
    const target = Number(this.props.targetAmount.value.toString());
    return Math.min(100, (current / target) * 100);
  }

  daysRemaining(): number | null {
    if (!this.props.targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = this.props.targetDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  dailyRequired(): number | null {
    if (!this.props.targetDate) return null;
    const days = this.daysRemaining();
    if (days === null || days <= 0) return null;
    const remaining = Number(this.props.targetAmount.value) - Number(this.props.currentAmount.value);
    if (remaining <= 0) return 0;
    return remaining / days;
  }

  monthlyRequired(): number | null {
    const daily = this.dailyRequired();
    if (daily === null) return null;
    return daily * 30;
  }
}
