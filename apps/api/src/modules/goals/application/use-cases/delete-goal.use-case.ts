import { Injectable, Inject, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { IGoalRepository, GOAL_REPOSITORY } from '../../domain/goal.repository.interface';

/**
 * Use case: Eliminar (soft delete) una meta del usuario.
 *
 * Solo el propietario puede eliminar la meta.
 * Registra `deleted_at` para cumplir con el soft delete del esquema.
 */
@Injectable()
export class DeleteGoalUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: IGoalRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  async execute(userId: string, id: string): Promise<void> {
    const goal = await this.goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException(`Goal with id "${id}" not found`);
    }

    goal.markAsDeleted();
    await this.goalRepository.delete(goal);
  }
}
