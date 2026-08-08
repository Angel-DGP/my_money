import { CATEGORY_REPOSITORY } from '../../domain/category.repository.interface';
import { Injectable, Inject } from '@nestjs/common';
import { UpdateCategoryDto, CategoryDto, SubcategoryDto } from '../../presentation/dtos/category.dto';
import { ICategoryRepository } from '../../domain/category.repository.interface';
import { ValidationException } from '@mymoney/shared';
import { CategoryException } from '../../domain/exceptions/category.exceptions';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(userId: string, categoryId: string, dto: UpdateCategoryDto): Promise<CategoryDto | SubcategoryDto> {
    const category = await this.categoryRepository.findById(categoryId, userId);
    
    if (!category) {
      throw new ValidationException('CAT_005', 'Category not found.', 'id');
    }

    if (category.isSystem) {
      throw CategoryException.systemCategoryImmutable();
    }

    if (dto.name && dto.name !== category.name) {
      // Check for duplicate name/type
      const existing = await this.categoryRepository.findByNameAndType(userId, dto.name, category.type);
      if (existing && existing.id !== categoryId) {
        throw new ValidationException('CAT_006', 'Category with this name and type already exists.', 'name');
      }
    }

    if (dto.name && dto.name !== category.name) {
      category.updateName(dto.name, userId);
    }
    
    // We only update icon/color if they are provided, but DTO allows nulls or undefined? 
    // In our DTO they are optional. Let's merge them with existing if not provided.
    const icon = dto.icon !== undefined ? dto.icon : category.icon;
    const color = dto.color !== undefined ? dto.color : category.color;
    
    if (icon !== category.icon || color !== category.color) {
      category.updateIconAndColor(icon || null, color || null, userId);
    }

    const newParentId = dto.parent_id === '' ? null : dto.parent_id;
    if (newParentId !== undefined && newParentId !== category.parentId) {
      if (newParentId !== null) {
        const parent = await this.categoryRepository.findById(newParentId, userId);
        if (!parent) {
          throw new ValidationException('CAT_005', 'Parent category not found.', 'parent_id');
        }
        if (parent.isSubcategory()) {
          throw CategoryException.maxTwoLevelsAllowed();
        }
        // Force type to match parent
        if (category.type !== parent.type) {
           throw new ValidationException('CAT_007', 'Subcategory type must match parent category type.', 'type');
        }
      }
      category.updateParent(newParentId, userId);
    }

    await this.categoryRepository.save(category);

    if (category.isSubcategory()) {
      return {
        id: category.id,
        name: category.name,
        type: category.type,
        is_system: category.isSystem,
        parent_id: category.parentId as string,
        icon: category.icon || undefined,
        color: category.color || undefined,
      } as SubcategoryDto;
    }

    return {
      id: category.id,
      name: category.name,
      type: category.type,
      is_system: category.isSystem,
      icon: category.icon || undefined,
      color: category.color || undefined,
      subcategories: [], // In this use case, we don't fetch subcategories deeply for the response, which is fine for simple CRUD
    } as CategoryDto;
  }
}
