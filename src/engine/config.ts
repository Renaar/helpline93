/** Game rules about time (GDD 2.2): a night lasts 20 to 30 real minutes. */
export const SHIFT_START = '22:00';
export const SHIFT_END = '06:00';
/** Real milliseconds per game minute: 22:00 → 06:00 (480 game minutes) ≈ 24 real minutes. */
export const GAME_MINUTE_MS = 3000;

/** Number of phone lines on the switchboard (GDD 4.1). */
export const LINE_IDS = [1, 2, 3] as const;
export type LineId = (typeof LINE_IDS)[number];

/** Operator names are typed at login (GDD 3.3). */
export const OPERATOR_NAME_MAX_LENGTH = 24;
