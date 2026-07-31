import { CategoryType } from './category.type';
import { CategoryException } from './exceptions/category.exceptions';
import { CategoryDeletedEvent } from './category.events';
import { randomUUID } from 'crypto';

export interface CreateCategoryProps {
  id?: string;
  userId: string | null; // null = system category
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  isSystem?: boolean;
}

export interface CreateSubcategoryProps {
  id?: string;
  userId: string | null;
  name: string;
  icon?: string | null;
  color?: string | null;
  isSystem?: boolean;
}

export interface ReconstituteCategoryProps {
  id: string;
  userId: string | null;
  parentId: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  createdAt: Date;
  createdBy: string | null;
  updatedAt: Date;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export class Category {
  readonly id: string;
  readonly userId: string | null;
  readonly parentId: string | null;
  readonly isSystem: boolean;
  private _name: string;
  private _type: CategoryType;
  private _icon: string | null;
  private _color: string | null;

  // Audit fields
  readonly createdAt: Date;
  readonly createdBy: string | null;
  private _updatedAt: Date;
  private _updatedBy: string | null;
  private _deletedAt: Date | null;
  private _deletedBy: string | null;

  private constructor(props: ReconstituteCategoryProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.parentId = props.parentId;
    this.isSystem = props.isSystem;
    this._name = props.name;
    this._type = props.type;
    this._icon = props.icon;
    this._color = props.color;

    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
    this._updatedAt = props.updatedAt;
    this._updatedBy = props.updatedBy;
    this._deletedAt = props.deletedAt;
    this._deletedBy = props.deletedBy;
  }

  // --- GETTERS ---

  get name(): string {
    return this._name;
  }

  get type(): CategoryType {
    return this._type;
  }

  get icon(): string | null {
    return this._icon;
  }

  get color(): string | null {
    return this._color;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get updatedBy(): string | null {
    return this._updatedBy;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get deletedBy(): string | null {
    return this._deletedBy;
  }

  // --- FACTORY METHODS ---

  static create(props: CreateCategoryProps): Category {
    const now = new Date();
    return new Category({
      id: props.id || randomUUID(),
      userId: props.userId,
      parentId: null,
      name: props.name,
      type: props.type,
      icon: props.icon || null,
      color: props.color || null,
      isSystem: props.isSystem || false,
      createdAt: now,
      createdBy: props.userId,
      updatedAt: now,
      updatedBy: props.userId,
      deletedAt: null,
      deletedBy: null,
    });
  }

  static createSubcategory(props: CreateSubcategoryProps, parent: Category): Category {
    if (parent.isSubcategory()) {
      throw CategoryException.maxTwoLevelsAllowed(); // CAT-R01
    }

    const now = new Date();
    return new Category({
      id: props.id || randomUUID(),
      userId: props.userId,
      parentId: parent.id,
      name: props.name,
      type: parent.type, // CAT-R02: Force type from parent
      icon: props.icon || null,
      color: props.color || null,
      isSystem: props.isSystem || false,
      createdAt: now,
      createdBy: props.userId,
      updatedAt: now,
      updatedBy: props.userId,
      deletedAt: null,
      deletedBy: null,
    });
  }

  static reconstitute(props: ReconstituteCategoryProps): Category {
    return new Category(props);
  }

  // --- MUTATIONS ---

  updateName(name: string, updatedBy: string): void {
    if (this.isSystem) {
      throw CategoryException.systemCategoryImmutable();
    }
    this._name = name;
    this._updatedAt = new Date();
    this._updatedBy = updatedBy;
  }

  updateIconAndColor(icon: string | null, color: string | null, updatedBy: string): void {
    if (this.isSystem) {
      throw CategoryException.systemCategoryImmutable();
    }
    this._icon = icon;
    this._color = color;
    this._updatedAt = new Date();
    this._updatedBy = updatedBy;
  }

  softDelete(deletedBy: string): CategoryDeletedEvent {
    if (this.isSystem) {
      throw CategoryException.systemCategoryImmutable();
    }
    this._deletedAt = new Date();
    this._deletedBy = deletedBy;
    this._updatedAt = new Date();
    this._updatedBy = deletedBy;

    return new CategoryDeletedEvent({
      categoryId: this.id,
      userId: this.userId as string,
    });
  }

  // --- QUERIES ---

  isCompatibleWith(transactionType: string): boolean {
    if (this._type === CategoryType.BOTH) return true;
    return this._type === transactionType;
  }

  isRoot(): boolean {
    return this.parentId === null;
  }

  isSubcategory(): boolean {
    return this.parentId !== null;
  }
}
