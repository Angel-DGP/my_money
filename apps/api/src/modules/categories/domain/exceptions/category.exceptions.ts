import { BusinessRuleViolationException } from '@mymoney/shared';

export class CategoryException extends BusinessRuleViolationException {
  constructor(code: string, message: string, rule?: string) {
    super(code, message, rule);
  }

  static systemCategoryImmutable(): CategoryException {
    return new CategoryException(
      'CAT_002',
      'System categories cannot be modified or deleted.',
      'CAT-R03'
    );
  }

  static cannotDeleteCategoryWithTransactions(count: number): CategoryException {
    return new CategoryException(
      'CAT_003',
      `Cannot delete category because it has ${count} transaction(s).`,
      'CAT-R04'
    );
  }

  static invalidTypeInheritance(): CategoryException {
    return new CategoryException(
      'CAT_004',
      'Subcategory type must match parent category type.',
      'CAT-R02'
    );
  }

  static maxTwoLevelsAllowed(): CategoryException {
    return new CategoryException(
      'CAT_001',
      'Categories can have a maximum of two levels (Parent -> Subcategory).',
      'CAT-R01'
    );
  }
}
