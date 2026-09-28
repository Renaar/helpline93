import type { CallType } from './phone.ts';
import type { GameState } from './state.ts';

/** A call planned at a game minute (GDD 7.9: `at` and `after_previous` are game minutes). */
export interface ScheduledCall {
  id: string;
  atMinute: number;
  type: CallType;
  missionId: string | null;
}

/** First planned event still to come (calls only for now; e-mails and scripted events: J3). */
export function nextEventMinute(state: GameState): number | null {
  const minutes = state.upcomingCalls.map((call) => call.atMinute);
  return minutes.length === 0 ? null : Math.min(...minutes);
}

/** A call is ringing, in progress or on hold. */
export function callInProgress(state: GameState): boolean {
  return state.phone.lines.some((line) => line.status !== 'idle');
}

/**
 * The operator may wait for the next event: the shift runs, no call is going on, nothing is
 * already being skipped, and something is planned later.
 */
export function canSkip(state: GameState): boolean {
  const next = nextEventMinute(state);
  return (
    state.shift.startedAt !== null &&
    state.shift.fastForward === null &&
    !callInProgress(state) &&
    next !== null &&
    next > state.shift.minute
  );
}
