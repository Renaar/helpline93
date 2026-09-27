import type { LineId } from './config.ts';
import type { CallType } from './phone.ts';

/**
 * Actions sent by the UI to the engine (GDD 8.2).
 * Dialogue actions (ASK, INSTRUCT, MANAGE, CAPTURE, OPEN_PAGE, CLOSE_TICKET…) arrive in J2.
 */
export type EngineAction =
  | { type: 'START' }
  /** Login done: the shift clock starts. */
  | { type: 'START_SHIFT'; operatorName: string }
  | { type: 'ANSWER_CALL'; line: LineId }
  | { type: 'HOLD_CALL'; line: LineId }
  | { type: 'RESUME_CALL'; line: LineId }
  | { type: 'HANG_UP'; line: LineId }
  /** Plans a call at a game minute (used by the night planner in J3, and by debug tools). */
  | { type: 'SCHEDULE_CALL'; atMinute: number; callType?: CallType }
  /**
   * Jumps to the next planned event, staged over `durationMs` of real time (the clock runs
   * fast). Refused during a call or when nothing is planned (see canSkip).
   */
  | { type: 'SKIP_TO_NEXT_EVENT'; durationMs: number }
  /** Debug: rings a line with a random caller (the night planner replaces this in J3). */
  | { type: 'DEBUG_INCOMING_CALL'; callType?: CallType }
  /** Debug round-trip used by the sandbox: the engine answers with `debug.pong` after a delay. */
  | { type: 'DEBUG_PING'; delayMs: number };
