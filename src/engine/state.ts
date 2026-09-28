import type { Clue, Dialogue, QueuedEmail, Ticket } from './dialogue/types.ts';
import { createPhoneState, type PhoneState } from './phone.ts';
import type { ScheduledCall } from './schedule.ts';
import { createShiftState, type ShiftState } from './shift.ts';

/** Bumped whenever the saved state shape changes, so old saves can be migrated (GDD 8.6). */
export const STATE_VERSION = 1;

/** Only French for now; kept in state and saves from day one (GDD 8.10). */
export type Language = 'fr';

/** Hidden narrative variables (GDD 2.3). */
export interface NarrativeVars {
  reputation: number;
  suspicion: number;
  awareness: number;
}

export interface GameState {
  version: typeof STATE_VERSION;
  language: Language;
  seed: number;
  started: boolean;
  /** Name typed at login (GDD 3.3). */
  operatorName: string | null;
  shift: ShiftState;
  phone: PhoneState;
  /** Calls planned at a game minute, not yet ringing. */
  upcomingCalls: ScheduledCall[];
  vars: NarrativeVars;
  /** trust_<npc>, keyed by caller id. */
  trust: Record<string, number>;
  flags: string[];
  /** Conversations of the night, by call id (GDD 4.2). */
  dialogues: Record<string, Dialogue>;
  /** HelpDesk tickets, oldest first (GDD 4.3). */
  tickets: Ticket[];
  /** Notebook clues, oldest first (GDD 4.7). */
  clues: Clue[];
  /** Manual pages consulted during the night. */
  consultedPages: string[];
  emails: QueuedEmail[];
}

export function createInitialState(seed: number, shiftStartMinute: number): GameState {
  return {
    version: STATE_VERSION,
    language: 'fr',
    seed,
    started: false,
    operatorName: null,
    shift: createShiftState(shiftStartMinute),
    phone: createPhoneState(),
    upcomingCalls: [],
    vars: { reputation: 0, suspicion: 0, awareness: 0 },
    trust: {},
    flags: [],
    dialogues: {},
    tickets: [],
    clues: [],
    consultedPages: [],
    emails: [],
  };
}
