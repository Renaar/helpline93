import { describe, expect, it } from 'vitest';
import { compare, conditionHolds, type ConditionContext } from './conditions.ts';

const context: ConditionContext = {
  flags: ['f.a'],
  captured: ['cap.x'],
  asked: ['q.a'],
  done: ['i.a'],
  params: { slot: '2' },
  mood: 0,
  vars: { reputation: 1, suspicion: 3, awareness: 0 },
};

describe('compare', () => {
  it.each([
    [0, '<=0', true],
    [1, '<=0', false],
    [3, '>=3', true],
    [2, '>=3', false],
    [-1, '<0', true],
    [0, '<0', false],
    [1, '>0', true],
    [0, '>0', false],
    [2, '=2', true],
    [2, '==2', true],
    [2, '2', true],
    [2, 2, true],
    [2, 3, false],
    [2, 'nonsense', false],
  ] as const)('%s %s → %s', (value, comparison, expected) => {
    expect(compare(value, comparison)).toBe(expected);
  });
});

describe('conditionHolds', () => {
  it('holds without conditions', () => {
    expect(conditionHolds(undefined, context)).toBe(true);
    expect(conditionHolds({}, context)).toBe(true);
  });

  it.each([
    ['flags_all', { flags_all: ['f.a'] }, { flags_all: ['f.a', 'f.b'] }],
    ['flags_none', { flags_none: ['f.b'] }, { flags_none: ['f.a'] }],
    ['captured', { captured: ['cap.x'] }, { captured: ['cap.y'] }],
    ['asked', { asked: ['q.a'] }, { asked: ['q.b'] }],
    ['done', { done: ['i.a'] }, { done: ['i.b'] }],
    ['param', { param: { slot: 2 } }, { param: { slot: 3 } }],
    ['mood', { mood: '>=0' }, { mood: '<0' }],
    ['vars', { vars: { suspicion: '>=3' } }, { vars: { reputation: '<=0' } }],
  ])('%s', (_name, holds, fails) => {
    expect(conditionHolds(holds, context)).toBe(true);
    expect(conditionHolds(fails, context)).toBe(false);
  });

  it('requires every condition at once', () => {
    expect(conditionHolds({ flags_all: ['f.a'], mood: '>0' }, context)).toBe(false);
    expect(conditionHolds({ flags_all: ['f.a'], mood: '0' }, context)).toBe(true);
  });

  it('compares parameters as text (YAML numbers match typed strings)', () => {
    expect(conditionHolds({ param: { slot: '2' } }, context)).toBe(true);
    expect(conditionHolds({ param: { missing: 1 } }, context)).toBe(false);
  });
});
