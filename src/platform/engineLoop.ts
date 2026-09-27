import type { Engine } from '../engine/engine.ts';

/** Calls engine.update() every animation frame. Returns a stop function. */
export function startEngineLoop(engine: Engine): () => void {
  let frame = requestAnimationFrame(function tick() {
    engine.update();
    frame = requestAnimationFrame(tick);
  });
  return () => {
    cancelAnimationFrame(frame);
  };
}
