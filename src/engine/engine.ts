import type { EngineAction } from './actions.ts';
import type { Clock } from './clock.ts';
import { EventBus } from './eventBus.ts';
import type { EngineEvent, EngineEventMap } from './events.ts';
import { createRng, type Rng } from './rng.ts';
import { Scheduler } from './scheduler.ts';
import { createInitialState, type GameState } from './state.ts';

export interface EngineOptions {
  clock: Clock;
  seed?: number;
}

export interface Engine {
  readonly events: EventBus<EngineEventMap>;
  readonly rng: Rng;
  getState(): Readonly<GameState>;
  dispatch(action: EngineAction): void;
  /** Emits every scheduled event that is due according to the clock. Call it every frame. */
  update(): void;
}

const DEFAULT_SEED = 1993;

export function createEngine({ clock, seed = DEFAULT_SEED }: EngineOptions): Engine {
  const events = new EventBus<EngineEventMap>();
  const scheduler = new Scheduler<EngineEvent>();
  const rng = createRng(seed);
  let state = createInitialState(seed);
  let pingCounter = 0;

  function emitNow(event: Omit<EngineEvent, 'at'>): void {
    events.emit({ ...event, at: clock.now() } as EngineEvent);
  }

  function dispatch(action: EngineAction): void {
    switch (action.type) {
      case 'START': {
        if (state.started) return;
        state = { ...state, started: true };
        emitNow({ type: 'engine.started', payload: { seed } });
        return;
      }
      case 'DEBUG_PING': {
        const requestedAt = clock.now();
        const at = requestedAt + Math.max(0, action.delayMs);
        pingCounter += 1;
        scheduler.schedule(at, {
          type: 'debug.pong',
          at,
          payload: { requestId: pingCounter, requestedAt },
        });
        return;
      }
    }
  }

  function update(): void {
    for (const { item } of scheduler.popDue(clock.now())) events.emit(item);
  }

  return { events, rng, getState: () => state, dispatch, update };
}
