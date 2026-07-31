import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { UpdateBudgetDto } from '../../presentation/dtos/update-budget.dto';
import { BudgetDto } from '../../presentation/dtos/budget.dto';

@Injectable()
export class UpdateBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, budgetId: string, dto: UpdateBudgetDto): Promise<BudgetDto> {
    const budget = await this.budgetRepository.findById(budgetId, userId);
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (dto.amount) {
      budget.updateAmount(Money.of(dto.amount, budget.amount.currency));
    }
    
    if (dto.alert_threshold) {
      budget.updateAlertThreshold(dto.alert_threshold);
    }

    await this.unitOfWork.execute(async () => {
      await this.budgetRepository.save(budget);
    });

    // Emit events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    budget.getDomainEvents().forEach((event: any) => this.eventEmitter.emit(event.type, event));
    budget.clearDomainEvents();

    return BudgetDto.fromDomain(budget);
  }
}
