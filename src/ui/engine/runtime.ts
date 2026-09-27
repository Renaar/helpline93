import { createEngine } from '../../engine/engine.ts';
import { startEngineLoop } from '../../platform/engineLoop.ts';
import { createRealClock } from '../../platform/realClock.ts';

/** The game engine instance used by the UI, running on the wall clock. */
export const engine = createEngine({ clock: createRealClock() });

let stopLoop: (() => void) | null = null;

/** Starts the engine and its per-frame update loop (idempotent). */
export function startEngine(): void {
  if (stopLoop) return;
  engine.dispatch({ type: 'START' });
  stopLoop = startEngineLoop(engine);
}
