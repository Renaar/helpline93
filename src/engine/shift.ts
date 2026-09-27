import { GAME_MINUTE_MS } from './config.ts';

export const MINUTES_PER_DAY = 24 * 60;

/** A staged jump in time: game time runs fast from `fromGameMs` to `toGameMs`. */
export interface FastForward {
  fromGameMs: number;
  toGameMs: number;
  /** Clock time (ms) at which the jump started. */
  startedAt: number;
  durationMs: number;
}

export interface ShiftState {
  /** Clock time (ms) at which the shift started, null before login. */
  startedAt: number | null;
  /** First minute of the shift (minutes since midnight). */
  startMinute: number;
  /** Game time skipped so far, in ms (added to the real time elapsed since the start). */
  offsetMs: number;
  fastForward: FastForward | null;
  /** Current shift minute; can exceed 1440 after midnight (see minuteOfDay). */
  minute: number;
}

export function createShiftState(startMinute: number): ShiftState {
  return { startedAt: null, startMinute, offsetMs: 0, fastForward: null, minute: startMinute };
}

/** "22:00" → 1320 (minutes since midnight). */
export function parseClockTime(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid clock time: ${value}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid clock time: ${value}`);
  return hours * 60 + minutes;
}

/** Wraps a shift minute to [0, 1440). */
export function minuteOfDay(minute: number): number {
  return ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Smooth start and stop for the staged jump (cubic ease-in-out). */
export function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** Game time elapsed since the shift start (ms), at clock time `now`. */
export function gameMsAt(shift: ShiftState, now: number): number {
  if (shift.startedAt === null) return 0;
  const ff = shift.fastForward;
  if (ff && now < ff.startedAt + ff.durationMs) {
    const progress = easeInOut((now - ff.startedAt) / ff.durationMs);
    return ff.fromGameMs + (ff.toGameMs - ff.fromGameMs) * progress;
  }
  return now - shift.startedAt + shift.offsetMs;
}

/** Shift minute at clock time `now`. */
export function minuteAt(shift: ShiftState, now: number): number {
  return shift.startMinute + Math.floor(gameMsAt(shift, now) / GAME_MINUTE_MS);
}

/**
 * Starts a staged jump to the start of `targetMinute`. After the jump, time flows in real time
 * again from there: the offset already accounts for the jump's own duration.
 */
export function startFastForward(
  shift: ShiftState,
  now: number,
  targetMinute: number,
  durationMs: number,
): ShiftState {
  if (shift.startedAt === null) return shift;
  const fromGameMs = gameMsAt(shift, now);
  const toGameMs = Math.max(fromGameMs, (targetMinute - shift.startMinute) * GAME_MINUTE_MS);
  const endsAt = now + Math.max(0, durationMs);
  return {
    ...shift,
    offsetMs: toGameMs - (endsAt - shift.startedAt),
    fastForward: { fromGameMs, toGameMs, startedAt: now, durationMs: Math.max(0, durationMs) },
  };
}

/** True once the jump's staging time is over. */
export function fastForwardEnded(shift: ShiftState, now: number): boolean {
  const ff = shift.fastForward;
  return ff !== null && now >= ff.startedAt + ff.durationMs;
}
