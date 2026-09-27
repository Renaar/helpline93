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
  vars: NarrativeVars;
  /** trust_<npc>, keyed by caller id. */
  trust: Record<string, number>;
  flags: string[];
}

export function createInitialState(seed: number): GameState {
  return {
    version: STATE_VERSION,
    language: 'fr',
    seed,
    started: false,
    vars: { reputation: 0, suspicion: 0, awareness: 0 },
    trust: {},
    flags: [],
  };
}
