import { createPhoneState, type PhoneState } from './phone.ts';

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

export interface ShiftState {
  /** Clock time (ms) at which the shift started, null before login. */
  startedAt: number | null;
  /** First minute of the shift (minutes since midnight). */
  startMinute: number;
  /** Current shift minute; can exceed 1440 after midnight. */
  minute: number;
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
  vars: NarrativeVars;
  /** trust_<npc>, keyed by caller id. */
  trust: Record<string, number>;
  flags: string[];
}

export function createInitialState(seed: number, shiftStartMinute: number): GameState {
  return {
    version: STATE_VERSION,
    language: 'fr',
    seed,
    started: false,
    operatorName: null,
    shift: { startedAt: null, startMinute: shiftStartMinute, minute: shiftStartMinute },
    phone: createPhoneState(),
    vars: { reputation: 0, suspicion: 0, awareness: 0 },
    trust: {},
    flags: [],
  };
}
