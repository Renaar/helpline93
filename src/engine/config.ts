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

/**
 * Caller typing rhythm (GDD 4.2.5). Game rules, not staging: they decide *when* a message
 * arrives. Typing time = base + characters × per-character time, divided by the caller's
 * `typing_speed`, multiplied by the mood factor, then clamped.
 */
export const TYPING = {
  /** The caller reads the operator's message before starting to type. */
  replyDelayMs: 750,
  /** Before the first message of a call. */
  openingDelayMs: 1000,
  /** Between two messages of the same reply. */
  messageGapMs: 400,
  baseMs: 400,
  perCharacterMs: 23,
  minMs: 600,
  maxMs: 2800,
  /** By mood, from -2 (panicked: short, hurried bursts) to +2 (relaxed). */
  moodFactor: { '-2': 0.7, '-1': 0.85, '0': 1, '1': 1.05, '2': 1.15 },
  /** Silence after the last message before the line goes dead (end_call). */
  endCallDelayMs: 2500,
} as const;

/** HelpDesk numbering: the previous operator's tickets come before (GDD 4.3). */
export const TICKET_FIRST_NUMBER = 1041;
