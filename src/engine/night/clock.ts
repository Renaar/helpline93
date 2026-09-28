import { MINUTES_PER_DAY, parseClockTime } from '../shift.ts';

/** "03:33" during a shift starting at 22:00 → 1653 (the next morning). */
export function shiftMinuteOf(time: string, shiftStartMinute: number): number {
  const minute = parseClockTime(time);
  return minute < shiftStartMinute ? minute + MINUTES_PER_DAY : minute;
}
