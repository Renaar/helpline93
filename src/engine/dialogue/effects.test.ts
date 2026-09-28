import { describe, expect, it } from 'vitest';
import { applyFlags, applyVarChange, applyVars, clampMood } from './effects.ts';

describe('effects', () => {
  it('adds or sets variables', () => {
    expect(applyVarChange(2, 1)).toBe(3);
    expect(applyVarChange(2, -2)).toBe(0);
    expect(applyVarChange(2, '=0')).toBe(0);
    expect(applyVarChange(2, '= -1')).toBe(-1);
    expect(applyVars({ reputation: 0, suspicion: 1, awareness: 0 }, { suspicion: 2 })).toEqual({
      reputation: 0,
      suspicion: 3,
      awareness: 0,
    });
  });

  it('sets and clears flags without duplicates', () => {
    expect(applyFlags(['f.a'], { set_flags: ['f.a', 'f.b'] })).toEqual(['f.a', 'f.b']);
    expect(applyFlags(['f.a', 'f.b'], { clear_flags: ['f.a'] })).toEqual(['f.b']);
  });

  it('keeps the mood between -2 and +2', () => {
    expect(clampMood(5)).toBe(2);
    expect(clampMood(-3)).toBe(-2);
    expect(clampMood(1)).toBe(1);
  });
});
