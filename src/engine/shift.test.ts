import { describe, expect, it } from 'vitest';
import { GAME_MINUTE_MS } from './config.ts';
import {
  createShiftState,
  easeInOut,
  fastForwardEnded,
  gameMsAt,
  minuteAt,
  minuteOfDay,
  parseClockTime,
  startFastForward,
} from './shift.ts';

const started = (at = 0) => ({ ...createShiftState(1320), startedAt: at });

describe('parseClockTime', () => {
  it('converts HH:MM to minutes since midnight', () => {
    expect(parseClockTime('22:00')).toBe(1320);
    expect(parseClockTime('06:30')).toBe(390);
  });

  it('rejects invalid times', () => {
    expect(() => parseClockTime('25:00')).toThrow();
    expect(() => parseClockTime('9:00')).toThrow();
  });
});

describe('shift clock', () => {
  it('stays at the start minute before login', () => {
    expect(minuteAt(createShiftState(1320), 999_999)).toBe(1320);
  });

  it('flows in real time: one game minute per real minute', () => {
    const shift = started(1000);
    expect(GAME_MINUTE_MS).toBe(60_000);
    expect(minuteAt(shift, 1000 + 59_999)).toBe(1320);
    expect(minuteAt(shift, 1000 + 5 * 60_000)).toBe(1325);
  });

  it('keeps counting past midnight; minuteOfDay wraps it', () => {
    const minute = minuteAt(started(), 150 * GAME_MINUTE_MS);
    expect(minute).toBe(1470);
    expect(minuteOfDay(minute)).toBe(30);
  });
});

describe('fast forward (staged jump)', () => {
  it('eases in and out between 0 and 1', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(2)).toBe(1);
  });

  it('runs the clock fast to the target minute, then real time again from there', () => {
    const now = 2 * GAME_MINUTE_MS; // 22:02
    const shift = startFastForward(started(), now, 1340, 2500); // jump to 22:20
    expect(minuteAt(shift, now)).toBe(1322);
    const halfway = minuteAt(shift, now + 1250);
    expect(halfway).toBeGreaterThan(1322);
    expect(halfway).toBeLessThan(1340);
    expect(fastForwardEnded(shift, now + 2499)).toBe(false);
    expect(fastForwardEnded(shift, now + 2500)).toBe(true);
    expect(gameMsAt(shift, now + 2500)).toBe(20 * GAME_MINUTE_MS);
    const settled = { ...shift, fastForward: null };
    expect(minuteAt(settled, now + 2500)).toBe(1340);
    expect(minuteAt(settled, now + 2500 + GAME_MINUTE_MS)).toBe(1341);
  });

  it('never goes back in time', () => {
    const shift = startFastForward(started(), 10 * GAME_MINUTE_MS, 1325, 1000);
    expect(gameMsAt(shift, 10 * GAME_MINUTE_MS + 1000)).toBe(10 * GAME_MINUTE_MS);
  });
});
