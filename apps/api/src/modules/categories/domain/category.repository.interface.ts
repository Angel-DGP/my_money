import { IRepository } from '@mymoney/shared';
import { Category } from './category.entity';

export interface ICategoryRepository extends IRepository<Category, string> {
  findAllByUser(userId: string): Promise<Category[]>;
  findSubcategories(parentId: string, userId: string): Promise<Category[]>;
  findSystemCategories(): Promise<Category[]>;
  hasTransactionsIncludingDeleted(categoryId: string, userId: string): Promise<boolean>;
  saveMany(categories: Category[]): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
