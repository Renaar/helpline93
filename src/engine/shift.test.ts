import { describe, expect, it } from 'vitest';
import { GAME_MINUTE_MS } from './config.ts';
import { minuteOfDay, parseClockTime, shiftMinuteAt } from './shift.ts';

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

describe('shiftMinuteAt', () => {
  it('advances one game minute per GAME_MINUTE_MS', () => {
    expect(shiftMinuteAt(1320, 1000, 1000)).toBe(1320);
    expect(shiftMinuteAt(1320, 1000, 1000 + GAME_MINUTE_MS - 1)).toBe(1320);
    expect(shiftMinuteAt(1320, 1000, 1000 + GAME_MINUTE_MS * 5)).toBe(1325);
  });

  it('keeps counting past midnight; minuteOfDay wraps it', () => {
    const minute = shiftMinuteAt(1320, 0, GAME_MINUTE_MS * 150);
    expect(minute).toBe(1470);
    expect(minuteOfDay(minute)).toBe(30);
  });
});
