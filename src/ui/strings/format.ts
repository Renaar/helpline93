import { minuteOfDay } from '../../engine/shift.ts';
import { LOCALE, t } from './i18n.ts';

const clockFormat = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

/** Shift minute (may exceed 1440) → "22:14", formatted for the active language. */
export function formatClock(minute: number): string {
  const wrapped = minuteOfDay(minute);
  return clockFormat.format(Date.UTC(1993, 0, 15, Math.floor(wrapped / 60), wrapped % 60));
}

/** "2135550142" → "(213) 555-0142" (pattern from the strings, ready for localisation). */
export function formatPhoneNumber(digits: string): string {
  if (!/^\d{10}$/.test(digits)) return digits;
  return t('format.phoneNumber', {
    area: digits.slice(0, 3),
    exchange: digits.slice(3, 6),
    line: digits.slice(6),
  });
}
