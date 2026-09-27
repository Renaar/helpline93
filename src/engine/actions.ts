/**
 * Actions sent by the UI to the engine (GDD 8.2).
 * Gameplay actions (ASK, INSTRUCT, MANAGE, CAPTURE, OPEN_PAGE, CLOSE_TICKET, ANSWER_CALL, HOLD…)
 * are added in their milestones.
 */
export type EngineAction =
  | { type: 'START' }
  /** Debug round-trip used by the sandbox: the engine answers with `debug.pong` after a delay. */
  | { type: 'DEBUG_PING'; delayMs: number };
