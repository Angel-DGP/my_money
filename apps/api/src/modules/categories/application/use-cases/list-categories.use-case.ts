import { CATEGORY_REPOSITORY } from '../../domain/category.repository.interface';
import { Injectable, Inject } from '@nestjs/common';
import { CategoryDto, SubcategoryDto } from '../../presentation/dtos/category.dto';
import { ICategoryRepository } from '../../domain/category.repository.interface';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(userId: string): Promise<CategoryDto[]> {
    // Fetch system categories and user categories
    const systemCategories = await this.categoryRepository.findSystemCategories();
    const userCategories = await this.categoryRepository.findAllByUser(userId);

    const allCategories = [...systemCategories, ...userCategories];

    // Build the hierarchy mapping
    const rootCategories: CategoryDto[] = [];
    const subcategoryMap = new Map<string, SubcategoryDto[]>();

    for (const category of allCategories) {
      if (category.isRoot()) {
        rootCategories.push({
          id: category.id,
          name: category.name,
          type: category.type,
          is_system: category.isSystem,
          icon: category.icon || undefined,
          color: category.color || undefined,
          subcategories: [], // will be populated
        });
      } else {
        const sub: SubcategoryDto = {
          id: category.id,
          name: category.name,
          type: category.type,
          is_system: category.isSystem,
          parent_id: category.parentId as string,
          icon: category.icon || undefined,
          color: category.color || undefined,
        };

        const parentId = category.parentId as string;
        if (!subcategoryMap.has(parentId)) {
          subcategoryMap.set(parentId, []);
        }
        subcategoryMap.get(parentId)!.push(sub);
      }
    }

    // Attach subcategories to their roots
    for (const root of rootCategories) {
      if (subcategoryMap.has(root.id)) {
        root.subcategories = subcategoryMap.get(root.id);
      }
    }

    return rootCategories;
  }
}
