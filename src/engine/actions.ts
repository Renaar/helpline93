import type { LineId } from './config.ts';
import type { CarryOver } from './night/types.ts';
import type { CallType } from './phone.ts';

/**
 * Actions sent by the UI to the engine (GDD 8.2).
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
  | { type: 'SCHEDULE_CALL'; atMinute: number; callType?: CallType; missionId?: string }
  /**
   * Jumps to the next planned event, staged over `durationMs` of real time (the clock runs
   * fast). Refused during a call or when nothing is planned (see canSkip).
   */
  | { type: 'SKIP_TO_NEXT_EVENT'; durationMs: number }
  /** Debug: rings a line now, with a mission or a random caller without content. */
  | { type: 'DEBUG_INCOMING_CALL'; callType?: CallType; missionId?: string }
  /** The operator read a manual page long enough: its options join the chat (GDD 4.2.2). */
  | { type: 'CONSULT_PAGE'; pageId: string }
  /** DEMANDER / INSTRUIRE / GÉRER (GDD 4.2.1). Parameters are raw strings typed or picked. */
  | { type: 'ASK'; callId: string; questionId: string }
  | { type: 'INSTRUCT'; callId: string; instructionId: string; params?: Record<string, string> }
  | { type: 'MANAGE'; callId: string; manageId: string }
  /** Clicked a tagged piece of a caller message (GDD 4.2.3). */
  | { type: 'CAPTURE'; callId: string; captureId: string }
  /** Closes a ticket whose call has ended, with a resolution code (GDD 4.3). */
  | { type: 'CLOSE_TICKET'; ticketId: string; code: string }
  /** Starts a night of the content (after login), with what the previous night handed over. */
  | { type: 'START_NIGHT'; nightId: string; carry?: CarryOver }
  | { type: 'READ_EMAIL'; emailId: string }
  /** Debug round-trip used by the sandbox: the engine answers with `debug.pong` after a delay. */
  | { type: 'DEBUG_PING'; delayMs: number };
