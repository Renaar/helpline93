import { LINE_IDS, type LineId } from './config.ts';

/** GDD 4.1: "libre" calls wait patiently, "urgent" ones will have a pressure gauge (4.10). */
export type CallType = 'libre' | 'urgent';

export interface Call {
  id: string;
  /** Ten digits, US style. */
  number: string;
  type: CallType;
  /** The mission played on this call (null: debug call without content). */
  missionId: string | null;
  /** Shift minute at which the phone started ringing. */
  ringingSince: number;
  answeredAt: number | null;
  /** Game clock time (ms) of the answer: the taskbar call widget shows the call duration. */
  answeredAtMs: number | null;
}

export type LineStatus = 'idle' | 'ringing' | 'active' | 'held';

export interface Line {
  id: LineId;
  status: LineStatus;
  call: Call | null;
}

export interface CallRecord {
  callId: string;
  missionId: string | null;
  line: LineId;
  number: string;
  type: CallType;
  ringingSince: number;
  answeredAt: number | null;
  endedAt: number;
}

export interface PhoneState {
  lines: Line[];
  history: CallRecord[];
}

export function createPhoneState(): PhoneState {
  return { lines: LINE_IDS.map((id) => ({ id, status: 'idle', call: null })), history: [] };
}

export function findLine(phone: PhoneState, id: LineId): Line | undefined {
  return phone.lines.find((line) => line.id === id);
}

export function firstIdleLine(phone: PhoneState): LineId | null {
  return phone.lines.find((line) => line.status === 'idle')?.id ?? null;
}

export function activeLine(phone: PhoneState): Line | undefined {
  return phone.lines.find((line) => line.status === 'active');
}

function withLine(phone: PhoneState, id: LineId, update: (line: Line) => Line): PhoneState {
  return { ...phone, lines: phone.lines.map((line) => (line.id === id ? update(line) : line)) };
}

/** Puts the active line (if any, other than `except`) on hold. Returns the held line id. */
function holdActive(phone: PhoneState, except: LineId): { phone: PhoneState; held: LineId | null } {
  const current = activeLine(phone);
  if (!current || current.id === except) return { phone, held: null };
  return {
    phone: withLine(phone, current.id, (line) => ({ ...line, status: 'held' })),
    held: current.id,
  };
}

export function ringLine(phone: PhoneState, id: LineId, call: Call): PhoneState | null {
  if (findLine(phone, id)?.status !== 'idle') return null;
  return withLine(phone, id, (line) => ({ ...line, status: 'ringing', call }));
}

/** Answers a ringing line. Any other active call is put on hold first. */
export function answerLine(
  phone: PhoneState,
  id: LineId,
  minute: number,
  nowMs = 0,
): { phone: PhoneState; held: LineId | null } | null {
  const line = findLine(phone, id);
  if (line?.status !== 'ringing' || !line.call) return null;
  const call = line.call;
  const result = holdActive(phone, id);
  return {
    phone: withLine(result.phone, id, (l) => ({
      ...l,
      status: 'active',
      call: { ...call, answeredAt: minute, answeredAtMs: nowMs },
    })),
    held: result.held,
  };
}

export function holdLine(phone: PhoneState, id: LineId): PhoneState | null {
  if (findLine(phone, id)?.status !== 'active') return null;
  return withLine(phone, id, (line) => ({ ...line, status: 'held' }));
}

/** Takes a held call back. Any other active call is put on hold first. */
export function resumeLine(
  phone: PhoneState,
  id: LineId,
): { phone: PhoneState; held: LineId | null } | null {
  if (findLine(phone, id)?.status !== 'held') return null;
  const result = holdActive(phone, id);
  return {
    phone: withLine(result.phone, id, (line) => ({ ...line, status: 'active' })),
    held: result.held,
  };
}

/** Ends an active or held call and records it in the history. */
export function hangUpLine(
  phone: PhoneState,
  id: LineId,
  minute: number,
): { phone: PhoneState; record: CallRecord } | null {
  const line = findLine(phone, id);
  if (!line?.call || (line.status !== 'active' && line.status !== 'held')) return null;
  const { call } = line;
  const record: CallRecord = {
    callId: call.id,
    missionId: call.missionId,
    line: id,
    number: call.number,
    type: call.type,
    ringingSince: call.ringingSince,
    answeredAt: call.answeredAt,
    endedAt: minute,
  };
  const cleared = withLine(phone, id, (l) => ({ ...l, status: 'idle', call: null }));
  return { phone: { ...cleared, history: [record, ...cleared.history] }, record };
}
