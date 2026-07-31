import { ValidationException } from './exceptions/index.js';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  MXN = 'MXN',
  COP = 'COP',
  ARS = 'ARS',
  BRL = 'BRL',
  CLP = 'CLP',
  PEN = 'PEN',
}

export class CurrencyVO {
  static isValid(code: string): boolean {
    return Object.values(Currency).includes(code as Currency);
  }

  static fromCode(code: string): Currency {
    if (!this.isValid(code)) {
      throw new ValidationException('INVALID_CURRENCY', `The currency code '${code}' is not supported or invalid.`);
    }
    return code as Currency;
  }

  static decimalPlaces(currency: Currency): number {
    // For MVP, assuming most supported currencies use 2 decimal places.
    // Can be extended for JPY (0), BHD (3), etc.
    return 2;
  }
}
