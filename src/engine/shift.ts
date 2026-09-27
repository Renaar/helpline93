import { GAME_MINUTE_MS } from './config.ts';

export const MINUTES_PER_DAY = 24 * 60;

/** "22:00" → 1320 (minutes since midnight). */
export function parseClockTime(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid clock time: ${value}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid clock time: ${value}`);
  return hours * 60 + minutes;
}

/**
 * Game minute reached at `now`, counted from the shift start (it can exceed 1440 after
 * midnight: use `minuteOfDay` to display it).
 */
export function shiftMinuteAt(startMinute: number, startedAt: number, now: number): number {
  return startMinute + Math.floor(Math.max(0, now - startedAt) / GAME_MINUTE_MS);
}

/** Wraps a shift minute to [0, 1440). */
export function minuteOfDay(minute: number): number {
  return ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}
