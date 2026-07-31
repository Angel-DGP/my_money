import { BusinessRuleViolationException } from '@mymoney/shared';

export class GoalException extends BusinessRuleViolationException {
  constructor(code: string, message: string, rule?: string) {
    super(code, message, rule);
  }

  static targetDateInPast(): GoalException {
    return new GoalException(
      'GOL_002',
      'La fecha objetivo no puede ser anterior a hoy',
      'GOL-R02'
    );
  }

  static targetAmountZeroOrLess(): GoalException {
    return new GoalException(
      'GOL_003',
      'El monto objetivo debe ser mayor a cero',
      'GOL-R02'
    );
  }

  static goalCompletedImmutable(): GoalException {
    return new GoalException(
      'GOL_004',
      'La meta ya ha sido completada y no puede ser modificada',
      'GOL-R04'
    );
  }

  static goalPaused(): GoalException {
    return new GoalException(
      'GOL_005',
      'La meta está pausada. Debe reactivarla para modificarla',
      'GOL-R05'
    );
  }
}
