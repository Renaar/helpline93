import { minuteOfDay } from '../../engine/shift.ts';
import { formatNumber, LOCALE, t } from './i18n.ts';

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

/** Call duration in ms → "04:12" (minutes may exceed 59). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (value: number) =>
    formatNumber(value, { minimumIntegerDigits: 2, useGrouping: false });
  return t('format.duration', { minutes: pad(Math.floor(total / 60)), seconds: pad(total % 60) });
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
