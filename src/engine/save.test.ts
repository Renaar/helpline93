import { describe, expect, it } from 'vitest';
import { parseSave, saveAfterNight, SAVE_VERSION } from './save.ts';

const carry = { vars: { reputation: 1, suspicion: 0, awareness: 0 }, flags: ['f.a'], trust: {} };

describe('save', () => {
  it('makes the next night reachable, keeping earlier ones', () => {
    const first = saveAfterNight(null, {
      operatorName: 'Alex',
      nextNightId: 'n.02',
      carry,
      notes: 'R-14 ?',
    });
    expect(first).toEqual({
      version: SAVE_VERSION,
      language: 'fr',
      operatorName: 'Alex',
      nights: { 'n.02': carry },
      notes: 'R-14 ?',
    });
    const second = saveAfterNight(first, {
      operatorName: 'Alex',
      nextNightId: 'n.03',
      carry,
      notes: '',
    });
    expect(Object.keys(second.nights)).toEqual(['n.02', 'n.03']);
    expect(
      saveAfterNight(null, { operatorName: 'A', nextNightId: null, carry, notes: '' }).nights,
    ).toEqual({});
  });

  it('round-trips through JSON and rejects broken or old saves', () => {
    const save = saveAfterNight(null, {
      operatorName: 'Alex',
      nextNightId: 'n.02',
      carry,
      notes: '',
    });
    expect(parseSave(JSON.stringify(save))).toEqual(save);
    expect(parseSave(null)).toBeNull();
    expect(parseSave('{oops')).toBeNull();
    expect(parseSave(JSON.stringify({ ...save, version: 0 }))).toBeNull();
    expect(parseSave('null')).toBeNull();
  });
});
