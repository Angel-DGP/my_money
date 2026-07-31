import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ICategoryRepository } from '../../domain/category.repository.interface';
import { Category } from '../../domain/category.entity';
import { CategoryType } from '../../domain/category.type';
// Note: We need to use Prisma generated types, but due to compilation we can just use any for raw if types are missing, 
// though Prisma generate should have populated them. Let's assume PrismaClient works.

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(raw: any): Category {
    return Category.reconstitute({
      id: raw.id,
      userId: raw.user_id,
      parentId: raw.parent_id,
      name: raw.name,
      type: raw.type as CategoryType,
      icon: raw.icon,
      color: raw.color,
      isSystem: raw.is_system,
      createdAt: raw.created_at,
      createdBy: raw.created_by,
      updatedAt: raw.updated_at,
      updatedBy: raw.updated_by,
      deletedAt: raw.deleted_at,
      deletedBy: raw.deleted_by,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toPersistence(entity: Category): any {
    return {
      id: entity.id,
      user_id: entity.userId,
      parent_id: entity.parentId,
      name: entity.name,
      type: entity.type,
      icon: entity.icon,
      color: entity.color,
      is_system: entity.isSystem,
      created_at: entity.createdAt,
      created_by: entity.createdBy,
      updated_at: entity.updatedAt,
      updated_by: entity.updatedBy,
      deleted_at: entity.deletedAt,
      deleted_by: entity.deletedBy,
    };
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const raw = await this.prisma.category.findFirst({
      where: {
        id,
        deleted_at: null,
        OR: [{ user_id: userId }, { is_system: true }],
      },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async save(entity: Category): Promise<void> {
    const data = this.toPersistence(entity);
    await this.prisma.category.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: {
        id,
        deleted_at: null,
        OR: [{ user_id: userId }, { is_system: true }],
      },
    });
    return count > 0;
  }

  async softDelete(id: string, userId: string, deletedBy: string): Promise<void> {
    await this.prisma.category.updateMany({
      where: {
        id,
        user_id: userId,
        is_system: false,
      },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
        updated_at: new Date(),
        updated_by: deletedBy,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Category[]> {
    const rawCategories = await this.prisma.category.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: { created_at: 'asc' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawCategories.map((raw: any) => this.toDomain(raw));
  }

  async findSubcategories(parentId: string, userId: string): Promise<Category[]> {
    const rawSubcategories = await this.prisma.category.findMany({
      where: {
        parent_id: parentId,
        deleted_at: null,
        OR: [{ user_id: userId }, { is_system: true }],
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawSubcategories.map((raw: any) => this.toDomain(raw));
  }

  async findSystemCategories(): Promise<Category[]> {
    const rawCategories = await this.prisma.category.findMany({
      where: {
        is_system: true,
        deleted_at: null,
      },
      orderBy: { created_at: 'asc' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawCategories.map((raw: any) => this.toDomain(raw));
  }

  async hasTransactionsIncludingDeleted(categoryId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: {
        category_id: categoryId,
        user_id: userId,
      },
    });
    return count > 0;
  }

  async saveMany(categories: Category[]): Promise<void> {
    // using interactive transaction to ensure atomicity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {
      for (const entity of categories) {
        const data = this.toPersistence(entity);
        await tx.category.upsert({
          where: { id: entity.id },
          create: data,
          update: data,
        });
      }
    });
  }
}
