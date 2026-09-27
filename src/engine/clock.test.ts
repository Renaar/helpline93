import { describe, expect, it } from 'vitest';
import { ManualClock } from './clock.ts';

describe('ManualClock', () => {
  it('starts at the given time and only moves when advanced', () => {
    const clock = new ManualClock(100);
    expect(clock.now()).toBe(100);
    clock.advance(50);
    expect(clock.now()).toBe(150);
  });

  it('refuses to go back in time', () => {
    expect(() => {
      new ManualClock().advance(-1);
    }).toThrow(RangeError);
  });
});
