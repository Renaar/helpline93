import type { NarrativeVars } from '../state.ts';

/** The night being played (GDD 7.9). */
export interface NightState {
  id: string;
  status: 'running' | 'ended';
  /** Shift minute at which the night ends (06:00 → 1800). */
  endMinute: number;
  /** Index of the next call of the night still to plan. */
  next: number;
  /** Every call of the night has been planned (or skipped): the end of shift is next. */
  allPlanned: boolean;
  /** Mission id → shift minute its call ended (or was skipped): base of `after_previous`. */
  endedAt: Record<string, number>;
}

/** An e-mail in the inbox (GDD 4.5). */
export interface ReceivedEmail {
  id: string;
  /** Shift minute of arrival. */
  minute: number;
  read: boolean;
}

/** End-of-shift report (GDD 2.2): tickets closed, average call time, activity log. */
export interface ShiftReport {
  nightId: string;
  callsAnswered: number;
  ticketsClosed: number;
  ticketsLeftOpen: number;
  /** Calls ended as `resolved` by the caller. */
  resolved: number;
  /** Average duration of answered calls, in game minutes (null without any call). */
  averageCallMinutes: number | null;
  /** One line per ticket, in order. */
  log: { ticketNumber: number; openedAt: number; code: string | null; outcome: string | null }[];
}

/** What a night hands over to the next one (GDD 4.8), saved at the end of each night. */
export interface CarryOver {
  vars: NarrativeVars;
  flags: string[];
  trust: Record<string, number>;
}
