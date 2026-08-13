import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';
import { UpdateGoalDto } from '../../presentation/dtos/update-goal.dto';
import { GoalDto } from '../../presentation/dtos/goal.dto';
import { Money, Currency } from '@mymoney/shared';

/**
 * Use case: Actualizar una meta existente del usuario.
 *
 * Solo los campos enviados en el DTO serán modificados.
 * Las metas COMPLETED no pueden ser actualizadas (protección en la entidad de dominio).
 */
@Injectable()
export class UpdateGoalUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
  ) {}

  async execute(userId: string, id: string, dto: UpdateGoalDto): Promise<GoalDto> {
    const goal = await this.goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException(`Goal with id "${id}" not found`);
    }

    // Actualizar monto objetivo si se provee (delega validación al dominio)
    if (dto.target_amount !== undefined) {
      const currency = (dto.currency ?? goal.targetAmount.currency) as Currency;
      const newTargetAmount = Money.of(dto.target_amount, currency);
      goal.updateTargetAmount(newTargetAmount);
    }

    // Actualizar propiedades simples (solo las definidas en el DTO)
    goal.update({
      name: dto.name,
      targetDate: dto.target_date !== undefined
        ? (dto.target_date ? new Date(dto.target_date) : null)
        : undefined,
      description: dto.description,
      priority: dto.priority,
      color: dto.color,
      icon: dto.icon,
      accountId: dto.account_id,
    });

    await this.goalRepository.save(goal);

    return GoalDto.fromDomain(goal);
  }
}
