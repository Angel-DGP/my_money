import { Module } from '@nestjs/common';
import { BudgetsController } from './presentation/budgets.controller';
import { CreateBudgetUseCase } from './application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from './application/use-cases/get-budgets.use-case';
import { UpdateBudgetUseCase } from './application/use-cases/update-budget.use-case';
import { DeactivateBudgetUseCase } from './application/use-cases/deactivate-budget.use-case';
import { GetBudgetByIdUseCase } from './application/use-cases/get-budget-by-id.use-case';
import { ReactivateBudgetUseCase } from './application/use-cases/reactivate-budget.use-case';
import { PrismaBudgetRepository } from './infrastructure/prisma-budget.repository';
import { BUDGET_REPOSITORY } from './domain/budget.repository.interface';
import { UpdateBudgetOnTransactionCreatedHandler } from './application/event-handlers/update-budget-on-transaction-created.handler';
import { UpdateBudgetOnTransactionDeletedHandler } from './application/event-handlers/update-budget-on-transaction-deleted.handler';
import { UpdateBudgetOnTransactionAmountChangedHandler } from './application/event-handlers/update-budget-on-transaction-amount-changed.handler';
import { UpdateBudgetOnTransactionDateChangedHandler } from './application/event-handlers/update-budget-on-transaction-date-changed.handler';
import { UpdateBudgetOnTransactionCategoryChangedHandler } from './application/event-handlers/update-budget-on-transaction-category-changed.handler';
import { DeactivateBudgetsOnCategoryDeletedHandler } from './application/event-handlers/deactivate-budgets-on-category-deleted.handler';
import { CategoriesModule } from '../categories/categories.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [CategoriesModule, PrismaModule], // Para acceder al CATEGORY_REPOSITORY y PrismaService
  controllers: [BudgetsController],
  providers: [
    CreateBudgetUseCase,
    GetBudgetsUseCase,
    UpdateBudgetUseCase,
    DeactivateBudgetUseCase,
    GetBudgetByIdUseCase,
    ReactivateBudgetUseCase,
    UpdateBudgetOnTransactionCreatedHandler,
    UpdateBudgetOnTransactionDeletedHandler,
    UpdateBudgetOnTransactionAmountChangedHandler,
    UpdateBudgetOnTransactionDateChangedHandler,
    UpdateBudgetOnTransactionCategoryChangedHandler,
    DeactivateBudgetsOnCategoryDeletedHandler,
    {
      provide: BUDGET_REPOSITORY,
      useClass: PrismaBudgetRepository,
    }
  ],
  exports: [BUDGET_REPOSITORY],
})
export class BudgetsModule {}
