import type { CaptureField, EndOutcome } from '../../content/schemas.ts';
import type { LineId } from '../config.ts';

/** The three reply verbs of the Operator Chat (GDD 4.2.1). */
export type Verb = 'ask' | 'instruct' | 'manage';

/** `abandoned`: the operator hung up before the caller was done. */
export type DialogueOutcome = EndOutcome | 'abandoned';

export type TranscriptEntry =
  | { id: number; from: 'caller'; text: string; minute: number }
  | { id: number; from: 'operator'; verb: Verb; optionId: string; text: string; minute: number }
  | { id: number; from: 'system'; event: 'held' | 'resumed' | 'ended'; minute: number };

/** One conversation, bound to a call and a mission (GDD 4.2). */
export interface Dialogue {
  callId: string;
  missionId: string;
  callerId: string;
  ticketId: string;
  status: 'talking' | 'ended';
  outcome: DialogueOutcome | null;
  mood: number;
  /** Pages whose options are unlocked for this call, in unlock order. */
  pages: string[];
  /** Local questions unlocked by the mission. */
  localQuestions: string[];
  asked: string[];
  done: string[];
  /** Action keys already performed (id + parameters), to detect repeats. */
  performed: string[];
  captured: string[];
  transcript: TranscriptEntry[];
  /** The typing indicator is on. */
  typing: boolean;
  /** Caller messages still to come: the operator waits for them before replying. */
  pending: number;
}

export type TicketStatus = 'open' | 'awaiting_closure' | 'closed';

/** HelpDesk ticket, opened when a mission call is answered (GDD 4.3). */
export interface Ticket {
  id: string;
  number: number;
  callId: string;
  missionId: string;
  line: LineId;
  phone: string;
  openedAt: number;
  /** Captured labels, by ticket field. */
  fields: Partial<Record<CaptureField, string[]>>;
  status: TicketStatus;
  outcome: DialogueOutcome | null;
  code: string | null;
  closedAt: number | null;
}

/** A captured piece of information, kept in the Notebook (GDD 4.7). */
export interface Clue {
  id: string;
  captureId: string;
  callId: string;
  missionId: string;
  label: string;
  field: CaptureField;
  keywords: string[];
  minute: number;
}

/** E-mail triggered by content, delivered by the Mail app (J3). */
export interface QueuedEmail {
  id: string;
  atMinute: number;
}
