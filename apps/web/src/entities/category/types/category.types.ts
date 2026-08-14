export type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Subcategory {
  id: string;
  name: string;
  type: CategoryType;
  is_system: boolean;
  parent_id: string;
  icon?: string | undefined;
  color?: string | undefined;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  is_system: boolean;
  icon?: string | undefined;
  color?: string | undefined;
  parent_id?: string | null | undefined;
  subcategories?: Subcategory[] | undefined;
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  parent_id?: string | null | undefined;
  icon?: string | undefined;
  color?: string | undefined;
}

export interface UpdateCategoryDto {
  name?: string | undefined;
  parent_id?: string | null | undefined;
  icon?: string | undefined;
  color?: string | undefined;
}
