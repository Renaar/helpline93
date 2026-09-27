import { describe, expect, it } from 'vitest';
import { ManualClock } from './clock.ts';
import { GAME_MINUTE_MS } from './config.ts';
import { createEngine } from './engine.ts';
import type { EngineEvent } from './events.ts';
import { STATE_VERSION } from './state.ts';

function setup() {
  const clock = new ManualClock();
  const engine = createEngine({ clock, seed: 7 });
  const log: EngineEvent[] = [];
  engine.events.onAny((e) => log.push(e));
  return { clock, engine, log };
}

describe('engine', () => {
  it('starts with a versioned French state', () => {
    const { engine } = setup();
    const state = engine.getState();
    expect(state.version).toBe(STATE_VERSION);
    expect(state.language).toBe('fr');
    expect(state.started).toBe(false);
  });

  it('emits engine.started once', () => {
    const { engine, log } = setup();
    engine.dispatch({ type: 'START' });
    engine.dispatch({ type: 'START' });
    expect(log).toEqual([{ type: 'engine.started', at: 0, payload: { seed: 7 } }]);
    expect(engine.getState().started).toBe(true);
  });

  it('delivers scheduled events only when the clock reaches them', () => {
    const { clock, engine, log } = setup();
    clock.advance(1000);
    engine.dispatch({ type: 'DEBUG_PING', delayMs: 500 });
    engine.update();
    expect(log).toEqual([]);
    clock.advance(499);
    engine.update();
    expect(log).toEqual([]);
    clock.advance(1);
    engine.update();
    expect(log).toEqual([
      { type: 'debug.pong', at: 1500, payload: { requestId: 1, requestedAt: 1000 } },
    ]);
  });

  it('stamps late events with their scheduled time, not the update time', () => {
    const { clock, engine, log } = setup();
    engine.dispatch({ type: 'DEBUG_PING', delayMs: 100 });
    clock.advance(10_000);
    engine.update();
    expect(log[0]?.at).toBe(100);
  });

  it('is deterministic for a given seed', () => {
    const a = createEngine({ clock: new ManualClock(), seed: 3 });
    const b = createEngine({ clock: new ManualClock(), seed: 3 });
    expect([a.rng(), a.rng()]).toEqual([b.rng(), b.rng()]);
  });

  it('starts the shift at login, once, with a trimmed name', () => {
    const { engine, log } = setup();
    engine.dispatch({ type: 'START_SHIFT', operatorName: '   ' });
    expect(engine.getState().shift.startedAt).toBeNull();
    engine.dispatch({ type: 'START_SHIFT', operatorName: '  Alex  ' });
    engine.dispatch({ type: 'START_SHIFT', operatorName: 'Other' });
    expect(engine.getState().operatorName).toBe('Alex');
    expect(log.map((e) => e.type)).toEqual(['shift.started']);
  });

  it('ticks the shift clock once per game minute after login', () => {
    const { clock, engine, log } = setup();
    clock.advance(GAME_MINUTE_MS * 10);
    engine.update();
    expect(engine.getState().shift.minute).toBe(1320);
    engine.dispatch({ type: 'START_SHIFT', operatorName: 'Alex' });
    clock.advance(GAME_MINUTE_MS * 2);
    engine.update();
    engine.update();
    expect(engine.getState().shift.minute).toBe(1322);
    expect(log.filter((e) => e.type === 'shift.minute')).toHaveLength(1);
  });

  it('runs a whole call: ring, answer, hold, resume, hang up', () => {
    const { engine, log } = setup();
    engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
    const incoming = log.find((e) => e.type === 'call.incoming');
    expect(incoming?.payload).toMatchObject({ callId: 'call-1', line: 1, callType: 'libre' });
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    engine.dispatch({ type: 'HOLD_CALL', line: 1 });
    engine.dispatch({ type: 'RESUME_CALL', line: 1 });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    expect(log.map((e) => e.type)).toEqual([
      'call.incoming',
      'call.answered',
      'call.held',
      'call.resumed',
      'call.ended',
    ]);
    expect(engine.getState().phone.history).toHaveLength(1);
  });

  it('ignores impossible phone actions without emitting anything', () => {
    const { engine, log } = setup();
    engine.dispatch({ type: 'ANSWER_CALL', line: 2 });
    engine.dispatch({ type: 'HANG_UP', line: 2 });
    expect(log).toEqual([]);
  });

  it('generates fictional 555-01xx numbers deterministically', () => {
    const a = setup();
    const b = setup();
    a.engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
    b.engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
    const number = a.engine.getState().phone.lines[0]?.call?.number ?? '';
    expect(number).toMatch(/^\d{3}55501\d{2}$/);
    expect(b.engine.getState().phone.lines[0]?.call?.number).toBe(number);
  });

  it('notifies subscribers on state changes only', () => {
    const { engine } = setup();
    let calls = 0;
    const off = engine.subscribe(() => calls++);
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    expect(calls).toBe(0);
    engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
    expect(calls).toBe(1);
    off();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    expect(calls).toBe(1);
  });

  describe('waiting for the next event', () => {
    function loggedIn() {
      const ctx = setup();
      ctx.engine.dispatch({ type: 'START_SHIFT', operatorName: 'Alex' });
      return ctx;
    }

    it('rings a planned call when its game minute comes', () => {
      const { clock, engine, log } = loggedIn();
      engine.dispatch({ type: 'SCHEDULE_CALL', atMinute: 1325 });
      clock.advance(4 * GAME_MINUTE_MS);
      engine.update();
      expect(log.some((e) => e.type === 'call.incoming')).toBe(false);
      clock.advance(GAME_MINUTE_MS);
      engine.update();
      expect(log.filter((e) => e.type === 'call.incoming')).toHaveLength(1);
      expect(engine.getState().upcomingCalls).toEqual([]);
    });

    it('jumps to the next planned call, staged, then rings it', () => {
      const { clock, engine, log } = loggedIn();
      engine.dispatch({ type: 'SCHEDULE_CALL', atMinute: 1340 });
      engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: 2500 });
      expect(log.find((e) => e.type === 'shift.skipStarted')?.payload).toEqual({
        fromMinute: 1320,
        toMinute: 1340,
        durationMs: 2500,
      });
      clock.advance(1250);
      engine.update();
      expect(engine.getState().shift.minute).toBeGreaterThan(1320);
      expect(log.some((e) => e.type === 'call.incoming')).toBe(false);
      clock.advance(1250);
      engine.update();
      expect(engine.getState().shift.minute).toBe(1340);
      expect(engine.getState().shift.fastForward).toBeNull();
      const types = log.map((e) => e.type);
      expect(types.indexOf('shift.skipEnded')).toBeLessThan(types.indexOf('call.incoming'));
      // Real time again afterwards.
      clock.advance(GAME_MINUTE_MS);
      engine.update();
      expect(engine.getState().shift.minute).toBe(1341);
    });

    it('refuses to skip during a call, with nothing planned, or before login', () => {
      const idle = setup();
      idle.engine.dispatch({ type: 'SCHEDULE_CALL', atMinute: 1340 });
      idle.engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: 2500 });
      expect(idle.log.some((e) => e.type === 'shift.skipStarted')).toBe(false);

      const nothing = loggedIn();
      nothing.engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: 2500 });
      expect(nothing.log.some((e) => e.type === 'shift.skipStarted')).toBe(false);

      const busy = loggedIn();
      busy.engine.dispatch({ type: 'SCHEDULE_CALL', atMinute: 1340 });
      busy.engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
      busy.engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: 2500 });
      expect(busy.log.some((e) => e.type === 'shift.skipStarted')).toBe(false);
    });

    it('keeps a due call waiting while every line is busy', () => {
      const { engine } = loggedIn();
      for (let i = 0; i < 3; i++) engine.dispatch({ type: 'DEBUG_INCOMING_CALL' });
      engine.dispatch({ type: 'SCHEDULE_CALL', atMinute: 1320 });
      engine.update();
      expect(engine.getState().upcomingCalls).toHaveLength(1);
      engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
      engine.dispatch({ type: 'HANG_UP', line: 1 });
      engine.update();
      expect(engine.getState().upcomingCalls).toEqual([]);
      expect(engine.getState().phone.lines[0]?.status).toBe('ringing');
    });
  });
});
