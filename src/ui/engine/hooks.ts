import { useEffect, useEffectEvent, useSyncExternalStore } from 'react';
import type { BusEvent } from '../../engine/eventBus.ts';
import type { EngineEventMap } from '../../engine/events.ts';
import type { GameState } from '../../engine/state.ts';
import { engine } from './runtime.ts';

/**
 * Reads a slice of the engine state and re-renders when it changes.
 * The selector must return a value already stored in the state (no new objects).
 */
export function useEngineState<T>(selector: (state: GameState) => T): T {
  return useSyncExternalStore(engine.subscribe, () => selector(engine.getState()));
}

/** Runs `handler` for every engine event of `type` while the component is mounted. */
export function useEngineEvent<K extends keyof EngineEventMap>(
  type: K,
  handler: (event: BusEvent<EngineEventMap, K>) => void,
): void {
  const onEvent = useEffectEvent(handler);
  useEffect(
    () =>
      engine.events.on(type, (event) => {
        onEvent(event);
      }),
    [type],
  );
}
