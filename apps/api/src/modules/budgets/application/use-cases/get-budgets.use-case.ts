import { DomainEvent } from '@mymoney/shared';
import { Injectable, Inject} from '@nestjs/common';
import { IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { Budget, BudgetStatus } from '../../domain/budget.entity';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { BudgetDto } from '../../presentation/dtos/budget.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GetBudgetsUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async findAll(userId: string, status?: string, categoryId?: string): Promise<BudgetDto[]> {
    let budgets = await this.budgetRepository.findAllByUser(userId);

    // Lazy check for expiration
    budgets = await this.processLazyExpiration(budgets);

    if (status) {
      budgets = budgets.filter(b => b.status === status as BudgetStatus);
    }
    if (categoryId) {
      budgets = budgets.filter(b => b.categoryId === categoryId);
    }

    return budgets.map(b => BudgetDto.fromDomain(b));
  }



  private async processLazyExpiration(budgets: Budget[]): Promise<Budget[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredBudgets = budgets.filter(b => 
      b.status === BudgetStatus.ACTIVE && b.endDate.getTime() < today.getTime()
    );

    if (expiredBudgets.length > 0) {
      await this.unitOfWork.execute(async () => {
        for (const budget of expiredBudgets) {
          budget.expire();
          await this.budgetRepository.save(budget);
        }
      });
      
      // Emit events outside transaction
      for (const budget of expiredBudgets) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        budget.getDomainEvents().forEach((event: DomainEvent) => this.eventEmitter.emit(event.constructor.name, event));
        budget.clearDomainEvents();
      }
    }

    return budgets;
  }
}
