import { CATEGORY_REPOSITORY } from '../../domain/category.repository.interface';
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ICategoryRepository } from '../../domain/category.repository.interface';
import { ValidationException } from '@mymoney/shared';
import { CategoryException } from '../../domain/exceptions/category.exceptions';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(userId: string, categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId, userId);
    if (!category) {
      throw new ValidationException('CAT_005', 'Category not found.', 'id');
    }

    if (category.isSystem) {
      throw CategoryException.systemCategoryImmutable();
    }

    const hasTransactions = await this.categoryRepository.hasTransactionsIncludingDeleted(categoryId, userId);
    if (hasTransactions) {
      // For simplicity in the exception message, we don't query the exact count here, 
      // but ideally we'd pass it if needed by the UI. Let's say "1 or more".
      throw CategoryException.cannotDeleteCategoryWithTransactions(1);
    }

    let categoriesToDelete = [category];

    // If it's a parent category, we also need to check its subcategories
    if (category.isRoot()) {
      const subcategories = await this.categoryRepository.findSubcategories(categoryId, userId);
      
      for (const sub of subcategories) {
        const subHasTx = await this.categoryRepository.hasTransactionsIncludingDeleted(sub.id, userId);
        if (subHasTx) {
          throw CategoryException.cannotDeleteCategoryWithTransactions(1);
        }
      }
      categoriesToDelete = [...categoriesToDelete, ...subcategories];
    }

    // Perform soft delete on all and collect events
    const events = categoriesToDelete.map(c => c.softDelete(userId));
    
    // Save all to database atomicaly
    await this.categoryRepository.saveMany(categoriesToDelete);

    // Publish events
    for (const event of events) {
      this.eventEmitter.emit(event.type, event);
    }
  }
}
