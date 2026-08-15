export const ECUADOR_TIMEZONE = 'America/Guayaquil';

/**
 * Parses a date string safely into a Date object.
 * If an ISO date-time string (e.g. "2026-08-14T15:30:00-05:00" or "2026-08-14T20:30:00.000Z") is given, it parses the exact timestamp.
 * If a date-only string (e.g. "2026-08-14") is given, it parses it in Ecuador timezone (UTC-5) at noon to prevent day-shifting.
 */
export function parseTransactionDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const trimmed = dateStr.trim();
  if (trimmed.includes('T')) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  // Date-only string "YYYY-MM-DD"
  const d = new Date(`${trimmed}T12:00:00-05:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}
