import { describe, expect, it } from 'vitest';
import { ManualClock } from '../clock.ts';
import { TYPING } from '../config.ts';
import { createEngine } from '../engine.ts';
import type { EngineEvent } from '../events.ts';
import { canReply } from './system.ts';
import { testContent } from './testContent.ts';

const CALL = 'call-1';

function setup() {
  const clock = new ManualClock();
  const engine = createEngine({ clock, seed: 5, content: testContent });
  const log: EngineEvent[] = [];
  engine.events.onAny((e) => log.push(e));
  engine.dispatch({ type: 'START_SHIFT', operatorName: 'Alex' });
  engine.dispatch({ type: 'DEBUG_INCOMING_CALL', missionId: 'm.n01_01' });
  /** Lets the caller finish typing everything queued. */
  function settle(maxMs = 60_000) {
    let quiet = 0;
    for (let t = 0; t < maxMs && quiet <= TYPING.endCallDelayMs; t += 100) {
      clock.advance(100);
      engine.update();
      const d = engine.getState().dialogues[CALL];
      quiet = d && d.pending === 0 && !d.typing ? quiet + 100 : 0;
    }
  }
  const dialogue = () => {
    const d = engine.getState().dialogues[CALL];
    if (!d) throw new Error('no dialogue');
    return d;
  };
  const callerLines = () =>
    dialogue().transcript.flatMap((e) => (e.from === 'caller' ? [e.text] : []));
  const types = () => log.map((e) => e.type);
  return { clock, engine, log, settle, dialogue, callerLines, types };
}

function answered() {
  const ctx = setup();
  ctx.engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
  ctx.settle();
  return ctx;
}

describe('dialogue system', () => {
  it('rings with the caller number and the mission call type', () => {
    const { engine, log } = setup();
    expect(engine.getState().phone.lines[0]?.call).toMatchObject({
      number: '7075550142',
      missionId: 'm.n01_01',
      type: 'libre',
    });
    expect(log.find((e) => e.type === 'call.incoming')?.payload).toMatchObject({
      number: '7075550142',
    });
  });

  it('opens a dialogue and a ticket when the call is answered', () => {
    const { engine, dialogue, types } = setup();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    expect(types()).toEqual(
      expect.arrayContaining(['call.answered', 'dialogue.started', 'ticket.opened']),
    );
    expect(dialogue()).toMatchObject({ status: 'talking', mood: 0, pending: 2 });
    expect(engine.getState().tickets[0]).toMatchObject({
      id: 'ticket-1',
      number: 1041,
      status: 'open',
      phone: '7075550142',
      line: 1,
    });
  });

  it('types the opening with a typing indicator, message after message', () => {
    const { clock, engine, log, dialogue } = setup();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    clock.advance(TYPING.openingDelayMs);
    engine.update();
    expect(dialogue().typing).toBe(true);
    expect(dialogue().transcript).toEqual([]);
    for (let i = 0; i < 100; i++) {
      clock.advance(100);
      engine.update();
    }
    const messages = log.filter((e) => e.type === 'caller.message');
    expect(messages.map((e) => e.payload.text)).toEqual([
      'Bonsoir.',
      'Ça fait [[3 bips|cap.bips]].',
    ]);
    const [first, second] = messages.map((e) => e.at);
    expect((second ?? 0) - (first ?? 0)).toBeGreaterThan(TYPING.messageGapMs);
    expect(dialogue()).toMatchObject({ typing: false, pending: 0 });
  });

  it('refuses replies while the caller is still typing', () => {
    const { engine, dialogue } = setup();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    expect(canReply(engine.getState(), CALL)).toBe(false);
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    expect(dialogue().asked).toEqual([]);
  });

  it('answers a question, then says "already said" on a repeat', () => {
    const { engine, settle, callerLines, dialogue, log } = answered();
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    expect(log.findLast((e) => e.type === 'operator.message')?.payload).toMatchObject({
      verb: 'ask',
      optionId: 'q.base.serial',
      text: 'Numéro de série ?',
    });
    settle();
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    settle();
    expect(callerLines().slice(-2)).toEqual(['[[0412|cap.serial]].', 'Déjà dit.']);
    expect(dialogue().asked).toEqual(['q.base.serial']);
  });

  it('refuses options that are not unlocked yet', () => {
    const { engine, dialogue } = answered();
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.bios.type' });
    engine.dispatch({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.local.secret' });
    expect(dialogue().transcript.filter((e) => e.from === 'operator')).toEqual([]);
  });

  it('unlocks page options when a page is consulted during the call', () => {
    const { engine, log, dialogue } = answered();
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.20' });
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.99' });
    expect(engine.getState().consultedPages).toEqual(['p.20', 'p.12']);
    expect(log.filter((e) => e.type === 'options.unlocked').map((e) => e.payload)).toEqual([
      {
        callId: CALL,
        pageId: 'p.12',
        questionIds: ['q.bios.type'],
        instructionIds: ['i.case.open', 'i.ram.remove'],
      },
    ]);
    expect(dialogue().pages).toEqual(['p.12']);
  });

  it('does not carry page options over from before the call', () => {
    const { engine, dialogue } = setup();
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    expect(dialogue().pages).toEqual([]);
  });

  it('never blocks on wrong instructions, and validates parameters', () => {
    const { engine, settle, callerLines, dialogue } = answered();
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    engine.dispatch({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove',
      params: { slot: '9' },
    });
    expect(dialogue().done).toEqual([]);
    engine.dispatch({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove',
      params: { slot: '2' },
    });
    settle();
    expect(callerLines().at(-1)).toBe("C'est fermé.");
    expect(dialogue().mood).toBe(-1);
    engine.dispatch({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    settle();
    engine.dispatch({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove',
      params: { slot: '1' },
    });
    settle();
    expect(callerLines().at(-1)).toBe('Toujours pareil.');
    expect(dialogue().mood).toBe(-2);
    expect(engine.getState().flags).toEqual(['f.t.open']);
    const operator = dialogue().transcript.filter((e) => e.from === 'operator');
    expect(operator.at(-1)).toMatchObject({ text: 'Retirez la barrette 1.' });
  });

  it('resolves the call: suspense, hang up by the caller, ticket awaiting closure', () => {
    const { engine, settle, callerLines, dialogue, types, clock, log } = answered();
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    engine.dispatch({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    settle();
    const before = clock.now();
    engine.dispatch({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove',
      params: { slot: '2' },
    });
    settle();
    expect(callerLines().slice(-2)).toEqual(['Je rallume…', 'Ça marche !']);
    // Forced typing (1 s) after a 2 s pause.
    const [first, second] = log.filter((e) => e.type === 'caller.message' && e.at > before);
    expect((second?.at ?? 0) - (first?.at ?? 0)).toBe(TYPING.messageGapMs + 2000 + 1000);
    expect(dialogue()).toMatchObject({ status: 'ended', outcome: 'resolved' });
    expect(engine.getState().phone.lines[0]?.status).toBe('idle');
    expect(engine.getState().tickets[0]).toMatchObject({
      status: 'awaiting_closure',
      outcome: 'resolved',
    });
    expect(types().slice(-3)).toEqual(['caller.message', 'dialogue.ended', 'call.ended']);
    expect(dialogue().transcript.at(-1)).toMatchObject({ from: 'system', event: 'ended' });
  });

  it('closes a ticket by code: matching rule, else default', () => {
    const good = answered();
    good.engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    good.engine.dispatch({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    good.settle();
    good.engine.dispatch({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove',
      params: { slot: '2' },
    });
    good.settle();
    good.engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-99' });
    expect(good.engine.getState().tickets[0]?.status).toBe('awaiting_closure');
    good.engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-07' });
    expect(good.engine.getState().tickets[0]).toMatchObject({ status: 'closed', code: 'R-07' });
    expect(good.engine.getState().vars.reputation).toBe(1);
    good.engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-09' });
    expect(good.engine.getState().vars.reputation).toBe(1);

    const wrong = answered();
    wrong.engine.dispatch({ type: 'HANG_UP', line: 1 });
    wrong.engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-07' });
    expect(wrong.engine.getState().vars.reputation).toBe(-1);
    expect(wrong.engine.getState().tickets[0]?.outcome).toBe('abandoned');
  });

  it('only closes a ticket once the call has ended', () => {
    const { engine } = answered();
    engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-07' });
    expect(engine.getState().tickets[0]?.status).toBe('open');
  });

  it('captures tagged information into the ticket and the Notebook', () => {
    const { engine, dialogue, log, settle } = answered();
    engine.dispatch({ type: 'CAPTURE', callId: CALL, captureId: 'cap.serial' });
    expect(dialogue().captured).toEqual([]);
    engine.dispatch({ type: 'CAPTURE', callId: CALL, captureId: 'cap.bips' });
    engine.dispatch({ type: 'CAPTURE', callId: CALL, captureId: 'cap.bips' });
    expect(dialogue().captured).toEqual(['cap.bips']);
    expect(engine.getState().tickets[0]?.fields).toEqual({ symptom: ['3 bips'] });
    expect(engine.getState().clues).toEqual([
      expect.objectContaining({ captureId: 'cap.bips', label: '3 bips', keywords: ['bips'] }),
    ]);
    expect(log.filter((e) => e.type === 'capture.added')).toHaveLength(1);
    // Captures unlock conditional answers.
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    settle();
    engine.dispatch({ type: 'CAPTURE', callId: CALL, captureId: 'cap.serial' });
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.since' });
    settle();
    expect(dialogue().transcript.at(-1)).toMatchObject({
      text: 'Depuis hier, et le numéro est noté.',
    });
  });

  it('applies unlock, email, vars "=N", clear_flags and hangup effects', () => {
    const { engine, settle, dialogue, log, callerLines } = answered();
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    settle();
    engine.dispatch({ type: 'CAPTURE', callId: CALL, captureId: 'cap.serial' });
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.since' });
    settle();
    expect(dialogue().localQuestions).toEqual(['q.local.secret']);
    expect(dialogue().pages).toEqual(['p.31']);
    const minute = engine.getState().shift.minute;
    const [email] = engine.getState().emails;
    expect(email?.id).toBe('e.test');
    expect(email?.atMinute).toBeGreaterThanOrEqual(minute + 5 - 1);
    expect(log.some((e) => e.type === 'email.queued')).toBe(true);

    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    engine.dispatch({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    settle();
    expect(engine.getState().flags).toEqual(['f.t.open']);
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.local.secret' });
    settle();
    expect(engine.getState().flags).toEqual([]);
    expect(engine.getState().vars.suspicion).toBe(3);
    engine.dispatch({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.base.restart' });
    settle();
    expect(callerLines().at(-1)).toBe('Vous êtes bizarre.');
    expect(dialogue().outcome).toBe('hangup');
  });

  it('calms the caller with GÉRER, once', () => {
    const { engine, settle, dialogue } = answered();
    engine.dispatch({ type: 'MANAGE', callId: CALL, manageId: 'g.calm' });
    settle();
    engine.dispatch({ type: 'MANAGE', callId: CALL, manageId: 'g.calm' });
    settle();
    expect(dialogue().mood).toBe(1);
  });

  it('puts the caller on hold and back, and refuses replies meanwhile', () => {
    const { engine, settle, dialogue, callerLines } = answered();
    engine.dispatch({ type: 'HOLD_CALL', line: 1 });
    settle();
    expect(callerLines().at(-1)).toBe("J'attends.");
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    expect(dialogue().asked).toEqual([]);
    engine.dispatch({ type: 'RESUME_CALL', line: 1 });
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    expect(dialogue().asked).toEqual(['q.base.serial']);
    const system = dialogue().transcript.flatMap((e) => (e.from === 'system' ? [e.event] : []));
    expect(system).toEqual(['held', 'resumed']);
  });

  it('stops the conversation when the operator hangs up', () => {
    const { engine, settle, dialogue, callerLines } = answered();
    engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.serial' });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    settle();
    expect(dialogue()).toMatchObject({ status: 'ended', outcome: 'abandoned', pending: 0 });
    expect(callerLines()).not.toContain('[[0412|cap.serial]].');
  });

  it('is deterministic for a seed', () => {
    const run = () => {
      const { engine, settle, callerLines } = answered();
      engine.dispatch({ type: 'ASK', callId: CALL, questionId: 'q.base.since' });
      settle();
      engine.dispatch({ type: 'MANAGE', callId: CALL, manageId: 'g.wait' });
      settle();
      return callerLines();
    };
    expect(run()).toEqual(run());
  });
});
