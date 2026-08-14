import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';

@Injectable()
export class DeleteBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const budget = await this.budgetRepository.findById(id, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.budgetRepository.delete(id, userId);
  }
}
