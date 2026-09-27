import type { LineId } from './config.ts';
import type { AnyBusEvent } from './eventBus.ts';
import type { CallRecord, CallType } from './phone.ts';

/**
 * Timestamped events sent by the engine to the UI (GDD 8.2).
 * The engine decides *what* happens; the UI decides *how* to stage it.
 */
export interface EngineEventMap {
  'engine.started': { seed: number };
  'shift.started': { operatorName: string; minute: number };
  /** Emitted each time the shift clock reaches a new game minute. */
  'shift.minute': { minute: number };
  /** A staged jump in time begins (the UI stages it: fast clock, soft sound). */
  'shift.skipStarted': { fromMinute: number; toMinute: number; durationMs: number };
  'shift.skipEnded': { minute: number };
  'call.scheduled': { callId: string; atMinute: number; callType: CallType };
  'call.incoming': { callId: string; line: LineId; number: string; callType: CallType };
  /** `held` = line automatically put on hold to take this call. */
  'call.answered': { callId: string; line: LineId; held: LineId | null };
  'call.held': { callId: string; line: LineId };
  'call.resumed': { callId: string; line: LineId; held: LineId | null };
  'call.ended': { record: CallRecord };
  'debug.pong': { requestId: number; requestedAt: number };
}

export type EngineEvent = AnyBusEvent<EngineEventMap>;
