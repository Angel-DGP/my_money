import { CATEGORY_REPOSITORY } from './domain/category.repository.interface';
import { Module } from '@nestjs/common';
import { CategoriesController } from './presentation/categories.controller';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { PrismaCategoryRepository } from './infrastructure/prisma/prisma-category.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from '../../sessions/sessions.module';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryUseCase,
    DeleteCategoryUseCase,
    ListCategoriesUseCase,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
