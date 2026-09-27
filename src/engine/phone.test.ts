import { describe, expect, it } from 'vitest';
import {
  answerLine,
  createPhoneState,
  firstIdleLine,
  hangUpLine,
  holdLine,
  resumeLine,
  ringLine,
  type Call,
  type PhoneState,
} from './phone.ts';

function call(id: string): Call {
  return { id, number: '2135550142', type: 'libre', ringingSince: 1320, answeredAt: null };
}

function ring(phone: PhoneState, line: 1 | 2 | 3, id: string): PhoneState {
  const next = ringLine(phone, line, call(id));
  if (!next) throw new Error('ring failed');
  return next;
}

describe('phone lines', () => {
  it('starts with three idle lines', () => {
    const phone = createPhoneState();
    expect(phone.lines.map((l) => l.status)).toEqual(['idle', 'idle', 'idle']);
    expect(firstIdleLine(phone)).toBe(1);
  });

  it('only rings an idle line', () => {
    const phone = ring(createPhoneState(), 1, 'a');
    expect(phone.lines[0]?.status).toBe('ringing');
    expect(ringLine(phone, 1, call('b'))).toBeNull();
    expect(firstIdleLine(phone)).toBe(2);
  });

  it('answers a ringing line and stamps the answer minute', () => {
    const result = answerLine(ring(createPhoneState(), 2, 'a'), 2, 1325);
    expect(result?.phone.lines[1]?.status).toBe('active');
    expect(result?.phone.lines[1]?.call?.answeredAt).toBe(1325);
    expect(result?.held).toBeNull();
  });

  it('refuses to answer a line that is not ringing', () => {
    expect(answerLine(createPhoneState(), 1, 0)).toBeNull();
  });

  it('puts the active call on hold when answering another line', () => {
    let phone = ring(ring(createPhoneState(), 1, 'a'), 2, 'b');
    phone = answerLine(phone, 1, 0)?.phone ?? phone;
    const result = answerLine(phone, 2, 1);
    expect(result?.held).toBe(1);
    expect(result?.phone.lines.map((l) => l.status)).toEqual(['held', 'active', 'idle']);
  });

  it('holds and resumes, holding the other active call on resume', () => {
    let phone = ring(ring(createPhoneState(), 1, 'a'), 2, 'b');
    phone = answerLine(phone, 1, 0)?.phone ?? phone;
    phone = holdLine(phone, 1) ?? phone;
    expect(phone.lines[0]?.status).toBe('held');
    phone = answerLine(phone, 2, 1)?.phone ?? phone;
    const resumed = resumeLine(phone, 1);
    expect(resumed?.held).toBe(2);
    expect(resumed?.phone.lines.map((l) => l.status)).toEqual(['active', 'held', 'idle']);
    expect(holdLine(createPhoneState(), 1)).toBeNull();
    expect(resumeLine(createPhoneState(), 1)).toBeNull();
  });

  it('hangs up an active or held call and records it', () => {
    let phone = ring(createPhoneState(), 3, 'a');
    expect(hangUpLine(phone, 3, 5)).toBeNull();
    phone = answerLine(phone, 3, 2)?.phone ?? phone;
    const result = hangUpLine(phone, 3, 9);
    expect(result?.phone.lines[2]).toEqual({ id: 3, status: 'idle', call: null });
    expect(result?.record).toMatchObject({ callId: 'a', line: 3, answeredAt: 2, endedAt: 9 });
    expect(result?.phone.history).toHaveLength(1);
  });
});
