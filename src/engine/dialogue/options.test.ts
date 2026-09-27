import { describe, expect, it } from 'vitest';
import { indexOptions } from '../../content/options.ts';
import type { Param } from '../../content/schemas.ts';
import type { Dialogue } from './types.ts';
import { testContent } from './testContent.ts';
import {
  acceptParams,
  actionKey,
  availableOptions,
  fillPlaceholders,
  paramAccepts,
} from './options.ts';

describe('parameters', () => {
  it('accepts choices, as text', () => {
    const param: Param = { type: 'choice', options: [1, 2] };
    expect(paramAccepts(param, '2')).toBe(true);
    expect(paramAccepts(param, '3')).toBe(false);
    expect(paramAccepts(param, '')).toBe(false);
  });

  it('accepts numbers within bounds', () => {
    const param: Param = { type: 'number', min: 1, max: 10 };
    expect(paramAccepts(param, '10')).toBe(true);
    expect(paramAccepts(param, '2,5')).toBe(true);
    expect(paramAccepts(param, '11')).toBe(false);
    expect(paramAccepts(param, 'abc')).toBe(false);
  });

  it('accepts text by pattern and length', () => {
    expect(paramAccepts({ type: 'text', pattern: 'JP\\d' }, 'jp3')).toBe(true);
    expect(paramAccepts({ type: 'text', pattern: 'JP\\d' }, 'JP')).toBe(false);
    expect(paramAccepts({ type: 'text', max_length: 3 }, 'abcd')).toBe(false);
  });

  it('accepts codes matching the format', () => {
    const param: Param = { type: 'code', format: 'R-##' };
    expect(paramAccepts(param, 'R-07')).toBe(true);
    expect(paramAccepts(param, 'r-07')).toBe(true);
    expect(paramAccepts(param, 'R-7')).toBe(false);
    expect(paramAccepts(param, 'X-07')).toBe(false);
    expect(paramAccepts({ type: 'code', format: 'AA' }, 'J3')).toBe(false);
  });

  it('normalises all parameters or refuses', () => {
    const params: Record<string, Param> = {
      slot: { type: 'choice', options: [1, 2] },
      code: { type: 'code', format: 'R-##' },
    };
    expect(acceptParams(params, { slot: ' 2 ', code: 'r-07' })).toEqual({
      slot: '2',
      code: 'R-07',
    });
    expect(acceptParams(params, { slot: '2' })).toBeNull();
    expect(acceptParams({}, {})).toEqual({});
  });

  it('fills placeholders and builds stable action keys', () => {
    expect(fillPlaceholders('JP{jumper} en {position}', { jumper: '3', position: '2-3' })).toBe(
      'JP3 en 2-3',
    );
    expect(actionKey('i.a', { b: '1', a: '2' })).toBe(actionKey('i.a', { a: '2', b: '1' }));
    expect(actionKey('q.a')).toBe('q.a');
  });
});

describe('available options', () => {
  const dialogue = (patch: Partial<Dialogue>): Dialogue => ({
    callId: 'call-1',
    missionId: 'm.n01_01',
    callerId: 'c.bob',
    ticketId: 'ticket-1',
    status: 'talking',
    outcome: null,
    mood: 0,
    pages: [],
    localQuestions: [],
    asked: [],
    done: [],
    performed: [],
    captured: [],
    transcript: [],
    typing: false,
    pending: 0,
    ...patch,
  });
  const index = indexOptions(testContent);

  it('offers the base options only, at first', () => {
    const options = availableOptions(testContent, index, dialogue({}));
    expect(options.ask.map((o) => o.id)).toEqual(['q.base.serial', 'q.base.since']);
    expect(options.instruct.map((o) => o.id)).toEqual(['i.base.restart']);
    expect(options.manage.map((o) => o.id)).toEqual(['g.calm', 'g.wait']);
  });

  it('adds unlocked pages in unlock order, then local questions', () => {
    const options = availableOptions(
      testContent,
      index,
      dialogue({ pages: ['p.31', 'p.12'], localQuestions: ['q.local.secret'] }),
    );
    expect(options.ask.map((o) => o.id)).toEqual([
      'q.base.serial',
      'q.base.since',
      'q.bios.type',
      'q.local.secret',
    ]);
    expect(options.instruct.map((o) => o.id)).toEqual([
      'i.base.restart',
      'i.code.enter',
      'i.case.open',
      'i.ram.remove',
    ]);
    expect(options.instruct[3]?.source).toEqual({ kind: 'page', pageId: 'p.12' });
    expect(Object.keys(options.instruct[3]?.params ?? {})).toEqual(['slot']);
  });
});
