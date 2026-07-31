import { BusinessRuleViolationException } from '@mymoney/shared';

export class BudgetException extends BusinessRuleViolationException {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

export class InvalidBudgetAmountException extends BudgetException {
  constructor() {
    super('BGT_001', 'El monto del presupuesto debe ser mayor a cero.');
  }
}

export class InvalidAlertThresholdException extends BudgetException {
  constructor() {
    super('BGT_002', 'El umbral de alerta debe estar entre 1 y 100.');
  }
}

export class BudgetAlreadyExistsException extends BudgetException {
  constructor() {
    super('BGT_003', 'Ya existe un presupuesto activo para esta categoría y período.');
  }
}

export class InvalidBudgetEndDateException extends BudgetException {
  constructor() {
    super('BGT_004', 'La fecha de fin debe ser posterior a la fecha de inicio.');
  }
}

export class BudgetNotActiveException extends BudgetException {
  constructor() {
    super('BGT_005', 'El presupuesto no está activo.');
  }
}
