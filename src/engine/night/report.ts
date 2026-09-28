import type { GameState } from '../state.ts';
import type { ShiftReport } from './types.ts';

/** Builds the end-of-shift report from the night's tickets and call history. */
export function buildReport(state: GameState, nightId: string): ShiftReport {
  const answered = state.phone.history.filter((record) => record.answeredAt !== null);
  const durations = answered.map((record) => record.endedAt - (record.answeredAt ?? 0));
  const total = durations.reduce((sum, minutes) => sum + minutes, 0);
  return {
    nightId,
    callsAnswered: answered.length,
    ticketsClosed: state.tickets.filter((t) => t.status === 'closed').length,
    ticketsLeftOpen: state.tickets.filter((t) => t.status !== 'closed').length,
    resolved: state.tickets.filter((t) => t.outcome === 'resolved').length,
    averageCallMinutes: durations.length === 0 ? null : Math.round(total / durations.length),
    log: state.tickets.map((t) => ({
      ticketNumber: t.number,
      openedAt: t.openedAt,
      code: t.code,
      outcome: t.outcome,
    })),
  };
}
