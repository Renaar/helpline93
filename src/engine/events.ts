import type { LineId } from './config.ts';
import type { AnyBusEvent } from './eventBus.ts';
import type { CaptureField } from '../content/schemas.ts';
import type { DialogueOutcome, Verb } from './dialogue/types.ts';
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
  /** A mission call was answered: the transcript and the ticket open. */
  'dialogue.started': { callId: string; missionId: string; ticketId: string };
  'caller.typing': { callId: string; typing: boolean };
  'caller.message': { callId: string; entryId: number; text: string };
  'operator.message': {
    callId: string;
    entryId: number;
    verb: Verb;
    optionId: string;
    text: string;
  };
  /** Options added to the chat menu by a consulted page or by the mission (GDD 4.2.2). */
  'options.unlocked': {
    callId: string;
    pageId: string | null;
    questionIds: string[];
    instructionIds: string[];
  };
  'page.consulted': { pageId: string };
  'capture.added': {
    callId: string;
    captureId: string;
    label: string;
    field: CaptureField;
    ticketId: string;
  };
  'dialogue.ended': { callId: string; outcome: DialogueOutcome };
  'ticket.opened': { ticketId: string };
  'ticket.closed': { ticketId: string; code: string };
  'email.queued': { emailId: string; atMinute: number };
  'debug.pong': { requestId: number; requestedAt: number };
}

export type EngineEvent = AnyBusEvent<EngineEventMap>;

/** An event before the engine stamps it with the current time. */
export type EventWithoutTime = {
  [E in EngineEvent as E['type']]: Omit<E, 'at'>;
}[EngineEvent['type']];
