import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Money, Currency, IUnitOfWork, UNIT_OF_WORK } from '@mymoney/shared';
import { Budget } from '../../domain/budget.entity';
import { IBudgetRepository, BUDGET_REPOSITORY } from '../../domain/budget.repository.interface';
import { CreateBudgetDto } from '../../presentation/dtos/create-budget.dto';
import { BudgetDto } from '../../presentation/dtos/budget.dto';
import { BudgetAlreadyExistsException } from '../../domain/exceptions/budget.exceptions';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../../categories/domain/category.repository.interface';

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, dto: CreateBudgetDto): Promise<BudgetDto> {
    const category = await this.categoryRepository.findById(dto.category_id, userId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.type !== 'EXPENSE' && category.type !== 'BOTH') {
      throw new UnprocessableEntityException('Cannot create budget for INCOME category');
    }

    const startDate = new Date(dto.start_date);
    
    // Validates BGT-R01
    const exists = await this.budgetRepository.existsActiveBudget(
      userId,
      dto.category_id,
      dto.period,
      startDate
    );

    if (exists) {
      throw new BudgetAlreadyExistsException();
    }

    const amount = Money.of(dto.amount, dto.currency as Currency);

    const budget = Budget.create({
      userId,
      categoryId: dto.category_id,
      period: dto.period,
      amount,
      startDate,
      alertThreshold: dto.alert_threshold,
    });

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
