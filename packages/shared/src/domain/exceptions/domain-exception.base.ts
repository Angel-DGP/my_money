export class DomainException extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    (Error as any).captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationException extends DomainException {
  constructor(code: string, message: string, public readonly field?: string) {
    super(code, message, field ? { field } : undefined);
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(code: string, message: string, public readonly rule?: string) {
    super(code, message, rule ? { rule } : undefined);
  }
}

export class InvariantViolationException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

export class ConcurrencyException extends DomainException {
  constructor(entityId: string, entityType: string) {
    super('CONCURRENCY_ERROR', 'The resource was modified by another operation. Please reload and try again.', { entityId, entityType });
  }
}

export class FeatureNotAvailableException extends DomainException {
  constructor(featureKey: string) {
    super('FEATURE_UNAVAILABLE', 'This feature is currently not available.', { featureKey });
  }
}
