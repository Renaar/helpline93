import type { AnyBusEvent } from './eventBus.ts';

/**
 * Timestamped events sent by the engine to the UI (GDD 8.2).
 * The engine decides *what* happens; the UI decides *how* to stage it.
 */
export interface EngineEventMap {
  'engine.started': { seed: number };
  'debug.pong': { requestId: number; requestedAt: number };
}

export type EngineEvent = AnyBusEvent<EngineEventMap>;
