import { parseTransactionDate, ECUADOR_TIMEZONE } from './date.util';

describe('API Date Utils (Ecuador Timezone)', () => {
  it('should parse ISO string with time correctly', () => {
    const isoString = '2026-08-14T20:30:00.000Z';
    const date = parseTransactionDate(isoString);
    expect(date.toISOString()).toBe('2026-08-14T20:30:00.000Z');
  });

  it('should parse date-only string without shifting day backward in Ecuador timezone', () => {
    const dateOnly = '2026-08-14';
    const date = parseTransactionDate(dateOnly);
    // 2026-08-14T12:00:00-05:00 is 2026-08-14T17:00:00.000Z
    expect(date.toISOString()).toBe('2026-08-14T17:00:00.000Z');
    
    // In Ecuador timezone (UTC-5), this must still be August 14
    const ecuadorDay = new Intl.DateTimeFormat('en-US', {
      timeZone: ECUADOR_TIMEZONE,
      day: '2-digit',
    }).format(date);
    expect(ecuadorDay).toBe('14');
  });

  it('should fallback to current date for invalid or empty input', () => {
    const date = parseTransactionDate('');
    expect(date).toBeInstanceOf(Date);
    expect(!isNaN(date.getTime())).toBe(true);
  });
});
