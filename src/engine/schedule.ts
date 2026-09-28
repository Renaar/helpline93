import type { CallType } from './phone.ts';
import type { GameState } from './state.ts';

/** A call planned at a game minute (GDD 7.9: `at` and `after_previous` are game minutes). */
export interface ScheduledCall {
  id: string;
  atMinute: number;
  type: CallType;
  missionId: string | null;
}

/** The end of the night is the next event: every call is planned and done. */
function nightEndIsNext(state: GameState): boolean {
  const night = state.night;
  return night?.status === 'running' && night.allPlanned && state.upcomingCalls.length === 0;
}

/** First planned event still to come: a call, an e-mail, or the end of the night. */
export function nextEventMinute(state: GameState): number | null {
  const minutes = [
    ...state.upcomingCalls.map((call) => call.atMinute),
    ...state.emails.map((email) => email.atMinute),
  ];
  const night = state.night;
  if (night && nightEndIsNext(state)) minutes.push(night.endMinute);
  return minutes.length === 0 ? null : Math.min(...minutes);
}

/** A call is ringing, in progress or on hold. */
export function callInProgress(state: GameState): boolean {
  return state.phone.lines.some((line) => line.status !== 'idle');
}

/**
 * The operator may wait for the next event: the shift runs, no call is going on, nothing is
 * already being skipped, and something is planned later. The end of the night waits until every
 * ticket is closed.
 */
export function canSkip(state: GameState): boolean {
  const next = nextEventMinute(state);
  const endOfNight = next !== null && next === state.night?.endMinute && nightEndIsNext(state);
  if (endOfNight && state.tickets.some((ticket) => ticket.status !== 'closed')) return false;
  return (
    state.shift.startedAt !== null &&
    state.shift.fastForward === null &&
    !callInProgress(state) &&
    next !== null &&
    next > state.shift.minute
  );
}
