import { describe, expect, it } from 'vitest';
import { Scheduler } from './scheduler.ts';

describe('Scheduler', () => {
  it('returns only due items, sorted by time', () => {
    const s = new Scheduler<string>();
    s.schedule(300, 'c');
    s.schedule(100, 'a');
    s.schedule(200, 'b');
    expect(s.popDue(200).map((e) => e.item)).toEqual(['a', 'b']);
    expect(s.size).toBe(1);
    expect(s.popDue(299)).toEqual([]);
    expect(s.popDue(300)).toEqual([{ at: 300, item: 'c' }]);
  });

  it('keeps insertion order for items due at the same time', () => {
    const s = new Scheduler<string>();
    s.schedule(10, 'first');
    s.schedule(10, 'second');
    s.schedule(10, 'third');
    expect(s.popDue(10).map((e) => e.item)).toEqual(['first', 'second', 'third']);
  });
});
