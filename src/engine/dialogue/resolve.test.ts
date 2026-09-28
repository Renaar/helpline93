import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import type { ConditionContext } from './conditions.ts';
import { pickLine, resolveResponse } from './resolve.ts';
import { testContent } from './testContent.ts';

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('test content');
  return value;
}
const mission = required(testContent.missions['m.n01_01']);
const caller = required(testContent.callers['c.bob']);

const context: ConditionContext = {
  flags: [],
  captured: [],
  asked: [],
  done: [],
  params: {},
  mood: 0,
  vars: { reputation: 0, suspicion: 0, awareness: 0 },
};

function resolve(optionId: string, patch: Partial<ConditionContext> = {}, repeated = false) {
  return resolveResponse({
    mission,
    caller,
    optionId,
    manage: testContent.base.manage.find((m) => m.id === optionId),
    repeated,
    context: { ...context, ...patch },
    rng: createRng(1),
  });
}

describe('resolveResponse', () => {
  it('plays the first mission entry whose condition holds', () => {
    expect(resolve('i.ram.remove').say).toEqual(["C'est fermé."]);
    const fixed = resolve('i.ram.remove', { flags: ['f.t.open'], params: { slot: '2' } });
    expect(fixed.kind).toBe('mission');
    expect(fixed.then?.end_call).toBe('resolved');
    expect(resolve('i.ram.remove', { flags: ['f.t.open'], params: { slot: '1' } }).say).toEqual([
      'Toujours pareil.',
    ]);
  });

  it('on a repeat, replays only conditional entries, else says "already said"', () => {
    expect(resolve('q.base.serial', {}, true)).toMatchObject({
      kind: 'repeat',
      say: ['Déjà dit.'],
    });
    const conditional = resolve('q.base.since', { captured: ['cap.serial'] }, true);
    expect(conditional.say).toEqual(['Depuis hier, et le numéro est noté.']);
  });

  it('answers GÉRER with the caller reaction and the default effect, once', () => {
    expect(resolve('g.calm')).toEqual({
      kind: 'manage',
      say: ['Je suis calme.'],
      then: { mood: 1 },
    });
    expect(resolve('g.calm', {}, true).then).toBeUndefined();
    // No reaction written for g.wait: an "irrelevant" line, never silence.
    expect(resolve('g.wait').say).toHaveLength(1);
  });

  it('falls back to an irrelevant line for unexpected options', () => {
    const response = resolve('q.bios.type');
    expect(response.kind).toBe('irrelevant');
    expect(['Hein ?', 'Quoi ?']).toContain(response.say[0]);
  });
});

describe('pickLine', () => {
  it('avoids repeating the previous line when there is a choice', () => {
    const rng = createRng(4);
    for (let i = 0; i < 20; i++) expect(pickLine(['A', 'B'], rng, 'A')).toEqual(['B']);
    expect(pickLine(['A'], rng, 'A')).toEqual(['A']);
    expect(pickLine([], rng)).toEqual([]);
  });
});
