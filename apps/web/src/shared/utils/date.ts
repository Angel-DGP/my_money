export const ECUADOR_TIMEZONE = 'America/Guayaquil';
export const ECUADOR_LOCALE = 'es-EC';

/**
 * Returns today's date in Ecuador timezone formatted as "YYYY-MM-DD".
 */
export function getEcuadorTodayString(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';

  return `${year}-${month}-${day}`;
}

/**
 * Returns the current time in Ecuador timezone formatted as "HH:mm".
 */
export function getEcuadorCurrentTimeString(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  let hour = parts.find((p) => p.type === 'hour')?.value || '00';
  if (hour === '24') hour = '00';
  const minute = parts.find((p) => p.type === 'minute')?.value || '00';

  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

/**
 * Converts any Date or ISO date string to date (YYYY-MM-DD) and time (HH:mm) in Ecuador timezone.
 */
export function splitDateAndTimeToEC(val?: string | Date | null): { date: string; time: string } {
  if (!val) {
    return {
      date: getEcuadorTodayString(),
      time: getEcuadorCurrentTimeString(),
    };
  }

  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) {
    return {
      date: getEcuadorTodayString(),
      time: getEcuadorCurrentTimeString(),
    };
  }

  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: ECUADOR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const year = dateParts.find((p) => p.type === 'year')?.value || '2026';
  const month = dateParts.find((p) => p.type === 'month')?.value || '01';
  const day = dateParts.find((p) => p.type === 'day')?.value || '01';
  let hour = dateParts.find((p) => p.type === 'hour')?.value || '00';
  if (hour === '24') hour = '00';
  const minute = dateParts.find((p) => p.type === 'minute')?.value || '00';

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
  };
}

/**
 * Combines a date string ("YYYY-MM-DD") and an optional time string ("HH:mm") into a full ISO string
 * explicitly anchored in Ecuador's UTC-5 timezone.
 */
export function combineDateAndTimeToECISO(dateStr: string, timeStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  const cleanDate = dateStr.split('T')[0] || getEcuadorTodayString();
  const time = timeStr && timeStr.trim() ? timeStr.trim() : getEcuadorCurrentTimeString();
  const formattedTime = time.length === 5 ? `${time}:00` : time;
  
  // Ecuador is UTC-5 with no DST
  const isoWithOffset = `${cleanDate}T${formattedTime}-05:00`;
  const parsed = new Date(isoWithOffset);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/**
 * Formats a date into localized Ecuador date & time: "14 ago 2026, 15:30"
 */
export function formatDateTimeEC(val: string | Date | null | undefined): string {
  if (!val) return '-';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Formats a date into a long human-friendly string in Ecuador timezone:
 * "Viernes, 14 de agosto de 2026, 15:30"
 */
export function formatLongDateTimeEC(val: string | Date | null | undefined): string {
  if (!val) return '-';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Formats a date only in Ecuador timezone: "14 ago 2026"
 */
export function formatDateEC(val: string | Date | null | undefined): string {
  if (!val) return '-';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats time only in Ecuador timezone: "15:30"
 */
export function formatTimeEC(val: string | Date | null | undefined): string {
  if (!val) return '';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
