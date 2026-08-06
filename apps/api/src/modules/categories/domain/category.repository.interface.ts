import { IRepository } from '@mymoney/shared';
import { Category } from './category.entity';
import { CategoryType } from './category.type';

export interface ICategoryRepository extends IRepository<Category, string> {
  findAllByUser(userId: string): Promise<Category[]>;
  findSubcategories(parentId: string, userId: string): Promise<Category[]>;
  findSystemCategories(): Promise<Category[]>;
  hasTransactionsIncludingDeleted(categoryId: string, userId: string): Promise<boolean>;
  saveMany(categories: Category[]): Promise<void>;
  findByNameAndType(userId: string, name: string, type: CategoryType): Promise<Category | null>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
