import type { CarryOver } from './night/types.ts';
import type { Language } from './state.ts';

/** Bumped whenever the save shape changes, so old saves can be migrated (GDD 8.6). */
export const SAVE_VERSION = 1;

/** Saved automatically at the end of each night (GDD 4.8). */
export interface SaveGame {
  version: typeof SAVE_VERSION;
  language: Language;
  operatorName: string;
  /** Nights reached, with what each one starts with. Any of them can be replayed. */
  nights: Record<string, CarryOver>;
  /** The Notebook's free notes, kept from night to night. */
  notes: string;
}

/** The save after a night: the next night becomes reachable with today's state. */
export function saveAfterNight(
  previous: SaveGame | null,
  args: { operatorName: string; nextNightId: string | null; carry: CarryOver; notes: string },
): SaveGame {
  const nights = { ...(previous?.nights ?? {}) };
  if (args.nextNightId !== null) nights[args.nextNightId] = args.carry;
  return {
    version: SAVE_VERSION,
    language: 'fr',
    operatorName: args.operatorName,
    nights,
    notes: args.notes,
  };
}

/** Reads a stored save; anything unreadable or from an unknown version is ignored. */
export function parseSave(raw: string | null): SaveGame | null {
  if (raw === null) return null;
  try {
    const data = JSON.parse(raw) as Partial<SaveGame> | null;
    if (data?.version !== SAVE_VERSION || typeof data.operatorName !== 'string') return null;
    if (typeof data.nights !== 'object' || typeof data.notes !== 'string') return null;
    return data as SaveGame;
  } catch {
    return null;
  }
}
