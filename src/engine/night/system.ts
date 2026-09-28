import type { ContentBundle, Night } from '../../content/schemas.ts';
import type { CallType } from '../phone.ts';
import { conditionHolds } from '../dialogue/conditions.ts';
import type { EventWithoutTime } from '../events.ts';
import type { GameState } from '../state.ts';
import { shiftMinuteOf } from './clock.ts';
import { buildReport } from './report.ts';
import type { CarryOver, NightState } from './types.ts';

/** What the night system needs from the engine. */
export interface NightHost {
  content: ContentBundle;
  getState: () => GameState;
  setState: (state: GameState) => void;
  emit: (event: EventWithoutTime) => void;
  /** Plans a call of a mission at a shift minute. */
  scheduleCall: (missionId: string, atMinute: number, callType: CallType) => void;
}

/**
 * Night planner (GDD 7.9), e-mail delivery (4.5) and end of shift (2.2).
 * Calls with `at` are planned at once; a call with `after_previous` is planned when the call
 * before it in the list has ended (or was skipped because its `when` did not hold).
 */
export function createNightSystem(host: NightHost) {
  const { content } = host;
  const state = () => host.getState();

  function nightOf(id: string | undefined): Night | undefined {
    return content.nights.find((n) => n.id === id);
  }

  function setNight(patch: Partial<NightState>): void {
    const s = state();
    if (!s.night) return;
    host.setState({ ...s, night: { ...s.night, ...patch } });
  }

  function holds(when: Night['calls'][number]['when']): boolean {
    const s = state();
    return conditionHolds(when, {
      flags: s.flags,
      captured: [],
      asked: [],
      done: [],
      params: {},
      mood: 0,
      vars: s.vars,
    });
  }

  /** Plans every call that can be planned now. */
  function planCalls(): void {
    const s = state();
    const night = nightOf(s.night?.id);
    if (!night || !s.night || s.night.status !== 'running') return;
    let { next } = s.night;
    const endedAt = { ...s.night.endedAt };
    const startMinute = s.shift.startMinute;
    while (next < night.calls.length) {
      const call = night.calls[next];
      if (!call) break;
      const mission = content.missions[call.mission];
      let atMinute: number;
      if (call.at !== undefined) atMinute = shiftMinuteOf(call.at, startMinute);
      else {
        const previous = night.calls[next - 1];
        const base = previous ? endedAt[previous.mission] : s.shift.minute;
        if (base === undefined) break;
        atMinute = base + (call.after_previous ?? 0);
      }
      if (!mission || !holds(call.when)) {
        // Skipped: the next `after_previous` counts from the same moment.
        endedAt[call.mission] =
          call.at === undefined ? atMinute - (call.after_previous ?? 0) : atMinute;
      } else {
        host.scheduleCall(mission.id, atMinute, mission.type);
      }
      next += 1;
    }
    setNight({ next, endedAt, allPlanned: next >= night.calls.length });
  }

  function start(nightId: string, carry?: CarryOver): void {
    const s = state();
    const night = nightOf(nightId);
    if (!night || s.night) return;
    const startMinute = s.shift.startMinute;
    const minute = s.shift.minute;
    host.setState({
      ...s,
      ...(carry
        ? { vars: { ...carry.vars }, flags: [...carry.flags], trust: { ...carry.trust } }
        : {}),
      night: {
        id: night.id,
        status: 'running',
        endMinute: shiftMinuteOf(night.end, startMinute),
        next: 0,
        allPlanned: false,
        endedAt: {},
      },
      emails: [
        ...s.emails,
        ...night.events.map((event) => ({
          id: event.id,
          atMinute: shiftMinuteOf(event.at, startMinute),
        })),
      ],
    });
    host.emit({ type: 'night.started', payload: { nightId: night.id } });
    for (const id of night.emails_at_boot) deliver(id, minute);
    planCalls();
  }

  function deliver(emailId: string, minute: number): void {
    const s = state();
    if (!(emailId in content.emails) || s.inbox.some((e) => e.id === emailId)) return;
    host.setState({ ...s, inbox: [...s.inbox, { id: emailId, minute, read: false }] });
    host.emit({ type: 'email.received', payload: { emailId } });
  }

  function readEmail(emailId: string): void {
    const s = state();
    if (!s.inbox.some((e) => e.id === emailId && !e.read)) return;
    host.setState({
      ...s,
      inbox: s.inbox.map((e) => (e.id === emailId ? { ...e, read: true } : e)),
    });
  }

  /** A call ended: its mission may release the next `after_previous` call. */
  function onCallEnded(missionId: string | null, minute: number): void {
    const night = state().night;
    if (!missionId || night?.status !== 'running') return;
    if (!nightOf(night.id)?.calls.some((c) => c.mission === missionId)) return;
    setNight({ endedAt: { ...night.endedAt, [missionId]: minute } });
    planCalls();
  }

  function update(): void {
    const s = state();
    const minute = s.shift.minute;
    if (s.shift.fastForward !== null) return;
    const due = s.emails.filter((e) => e.atMinute <= minute);
    if (due.length > 0) {
      host.setState({ ...s, emails: s.emails.filter((e) => e.atMinute > minute) });
      for (const email of due) deliver(email.id, minute);
    }
    const after = state();
    const night = after.night;
    const busy = after.phone.lines.some((line) => line.status !== 'idle');
    if (night?.status === 'running' && minute >= night.endMinute && !busy) {
      host.setState({
        ...after,
        night: { ...night, status: 'ended' },
        report: buildReport(after, night.id),
      });
      host.emit({ type: 'night.ended', payload: { nightId: night.id } });
    }
  }

  return { start, readEmail, onCallEnded, update };
}

/** What the next night inherits (GDD 4.8). */
export function carryOver(state: GameState): CarryOver {
  return { vars: { ...state.vars }, flags: [...state.flags], trust: { ...state.trust } };
}

/** The night after `nightId` in the content, if any. */
export function nextNightId(content: ContentBundle, nightId: string): string | null {
  const index = content.nights.findIndex((n) => n.id === nightId);
  return content.nights[index + 1]?.id ?? null;
}
