import Big from 'big.js';
import { Currency } from './currency.value-object.js';
import { InvariantViolationException } from './exceptions/index.js';

export class Money {
  private constructor(
    public readonly value: Big,
    public readonly currency: Currency
  ) {}

  static of(value: number | string | Big, currency: Currency): Money {
    try {
      const bigValue = new Big(value);
      return new Money(bigValue, currency);
    } catch (error) {
      throw new InvariantViolationException('INVALID_MONEY_VALUE', `The value '${value}' is not a valid number.`);
    }
  }

  static zero(currency: Currency): Money {
    return new Money(new Big(0), currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.value.plus(other.value), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.value.minus(other.value), this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.value.times(factor), this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.gt(other.value);
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.lt(other.value);
  }

  equals(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.eq(other.value);
  }

  isZero(): boolean {
    return this.value.eq(0);
  }

  isPositive(): boolean {
    return this.value.gt(0);
  }

  isNegative(): boolean {
    return this.value.lt(0);
  }

  sameCurrency(other: Money): boolean {
    return this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (!this.sameCurrency(other)) {
      throw new InvariantViolationException(
        'CURRENCY_MISMATCH',
        `Cannot operate on money with different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }

  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(Number(this.value.toString()));
  }

  toJSON(): { value: string; currency: string } {
    return {
      value: this.value.toFixed(4),
      currency: this.currency,
    };
  }
}
