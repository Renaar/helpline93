import type { Clock } from '../engine/clock.ts';

/** Wall-clock implementation of the engine Clock. `speed` > 1 accelerates time (debug). */
export function createRealClock(speed = 1): Clock {
  const start = performance.now();
  return { now: () => (performance.now() - start) * speed };
}
