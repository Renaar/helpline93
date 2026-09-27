import { describe, expect, it } from 'vitest';
import { ManualClock } from './clock.ts';
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
});
