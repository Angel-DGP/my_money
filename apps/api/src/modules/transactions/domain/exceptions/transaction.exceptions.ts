import { BusinessRuleViolationException, ValidationException } from '@mymoney/shared';

export class TransactionException extends BusinessRuleViolationException {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

export class InvalidTransactionAmountException extends ValidationException {
  constructor() {
    super('El monto de la transacción debe ser mayor a cero (TRX-R01)', 'TRX_001');
  }
}

export class InvalidTransactionDateException extends ValidationException {
  constructor() {
    super('La fecha de la transacción no puede ser mayor a 7 días en el futuro (TRX-R03)', 'TRX_003');
  }
}

export class IncompatibleCategoryException extends TransactionException {
  constructor(transactionType: string, categoryType: string) {
    super(
      `La categoría de tipo ${categoryType} no es compatible con una transacción de tipo ${transactionType} (TRX-R04)`,
      'TRX_004'
    );
  }
}

export class CannotEditTransactionTypeException extends TransactionException {
  constructor() {
    super('No se puede modificar el tipo de una transacción existente (TRX-R05)', 'TRX_005');
  }
}

export class CannotEditTransferTransactionException extends TransactionException {
  constructor() {
    super('Los movimientos individuales de una transferencia no se pueden editar por separado (TRF-R05)', 'TRF_005');
  }
}

export class TransferRequiresDifferentAccountsException extends TransactionException {
  constructor() {
    super('La cuenta de origen y destino de una transferencia no pueden ser la misma (TRF-R03)', 'TRF_003');
  }
}
