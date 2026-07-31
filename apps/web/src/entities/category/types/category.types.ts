export type CategoryType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Subcategory {
  id: string;
  name: string;
  type: CategoryType;
  is_system: boolean;
  parent_id: string;
  icon?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  is_system: boolean;
  icon?: string;
  color?: string;
  subcategories?: Subcategory[];
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  parent_id?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}
