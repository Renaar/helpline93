/** Game rules about time (GDD 2.2): a night lasts 20 to 30 real minutes. */
export const SHIFT_START = '22:00';
export const SHIFT_END = '06:00';
/**
 * Real milliseconds per game minute: time flows like real life during calls and exploration.
 * Quiet stretches between calls are skipped (GDD 2.2 / 4.1), which keeps a night at 20–30 min.
 */
export const GAME_MINUTE_MS = 60_000;

/** Number of phone lines on the switchboard (GDD 4.1). */
export const LINE_IDS = [1, 2, 3] as const;
export type LineId = (typeof LINE_IDS)[number];

/** Operator names are typed at login (GDD 3.3). */
export const OPERATOR_NAME_MAX_LENGTH = 24;
