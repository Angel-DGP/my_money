import { CATEGORY_REPOSITORY } from '../../domain/category.repository.interface';
import { Injectable, Inject } from '@nestjs/common';
import { CreateCategoryDto, CategoryDto, SubcategoryDto } from '../../presentation/dtos/category.dto';
import { ICategoryRepository } from '../../domain/category.repository.interface';
import { Category } from '../../domain/category.entity';
import { ValidationException } from '@mymoney/shared';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(userId: string, dto: CreateCategoryDto): Promise<CategoryDto | SubcategoryDto> {
    let category: Category;

    if (dto.parent_id) {
      const parent = await this.categoryRepository.findById(dto.parent_id, userId);
      if (!parent) {
        throw new ValidationException('CAT_005', 'Parent category not found.', 'parent_id');
      }

      category = Category.createSubcategory({
        userId,
        name: dto.name,
        icon: dto.icon,
        color: dto.color,
        isSystem: false,
      }, parent);
    } else {
      const existing = await this.categoryRepository.findByNameAndType(userId, dto.name, dto.type);
      if (existing) {
        throw new ValidationException('CAT_006', 'Category with this name and type already exists.', 'name');
      }

      category = Category.create({
        userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
        color: dto.color,
        isSystem: false,
      });
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
      subcategories: [],
    } as CategoryDto;
  }
}
