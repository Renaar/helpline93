/**
 * Plays the real missions of content/ through the engine (J2 checkpoint, GDD 9.3):
 * the intended solution works end to end, and wrong answers never block.
 */
import { describe, expect, it } from 'vitest';
import { loadBundle } from '../src/content/bundle.ts';
import { ManualClock, createEngine } from '../src/engine/index.ts';
import { readContentFiles } from '../tools/contentFiles.ts';

const content = loadBundle(readContentFiles());
const CALL = 'call-1';

function call(missionId: string) {
  const clock = new ManualClock();
  const engine = createEngine({ clock, content });
  engine.dispatch({ type: 'START_SHIFT', operatorName: 'Test' });
  engine.dispatch({ type: 'DEBUG_INCOMING_CALL', missionId });
  engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
  const settle = () => {
    let quiet = 0;
    for (let t = 0; t < 120_000 && quiet <= 3000; t += 100) {
      clock.advance(100);
      engine.update();
      const d = engine.getState().dialogues[CALL];
      quiet = d && d.pending === 0 && !d.typing ? quiet + 100 : 0;
    }
  };
  const dialogue = () => {
    const d = engine.getState().dialogues[CALL];
    if (!d) throw new Error('no dialogue');
    return d;
  };
  const lastCallerLine = () => dialogue().transcript.findLast((e) => e.from === 'caller');
  settle();
  return { engine, settle, dialogue, lastCallerLine };
}

describe('Trois bips (m.n01_03)', () => {
  it('is solved end to end, as in GDD 4.2.7', () => {
    const { engine, settle, dialogue } = call('m.n01_03');
    const act = (action: Parameters<typeof engine.dispatch>[0]) => {
      engine.dispatch(action);
      settle();
    };
    act({ type: 'CAPTURE', callId: CALL, captureId: 'cap.bips' });
    act({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    act({ type: 'ASK', callId: CALL, questionId: 'q.bios.bip_type' });
    act({ type: 'CAPTURE', callId: CALL, captureId: 'cap.short' });
    act({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove_slot',
      params: { slot: '2' },
    });
    expect(dialogue()).toMatchObject({ status: 'ended', outcome: 'resolved' });
    expect(engine.getState().tickets[0]?.fields.symptom).toEqual([
      '3 bips au démarrage',
      'Bips courts',
    ]);
    engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-07' });
    expect(engine.getState().tickets[0]?.status).toBe('closed');
    expect(engine.getState().vars.reputation).toBe(1);
  });

  it('never blocks on wrong answers, and can still be solved afterwards', () => {
    const { engine, settle, dialogue, lastCallerLine } = call('m.n01_03');
    const act = (action: Parameters<typeof engine.dispatch>[0]) => {
      const before = dialogue().transcript.length;
      engine.dispatch(action);
      settle();
      // Every accepted action gets an answer from the caller.
      expect(dialogue().transcript.length).toBeGreaterThan(before + 1);
      expect(lastCallerLine()?.from).toBe('caller');
    };
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.31' });
    act({ type: 'ASK', callId: CALL, questionId: 'q.board.jumper_label' });
    act({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.base.restart' });
    act({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.base.restart' });
    act({ type: 'MANAGE', callId: CALL, manageId: 'g.calm' });
    act({ type: 'MANAGE', callId: CALL, manageId: 'g.reformulate' });
    act({ type: 'MANAGE', callId: CALL, manageId: 'g.wait' });
    engine.dispatch({ type: 'CONSULT_PAGE', pageId: 'p.12' });
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove_slot',
      params: { slot: '2' },
    });
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.jumper.set',
      params: { jumper: '5', position: '2-3' },
    });
    act({ type: 'INSTRUCT', callId: CALL, instructionId: 'i.case.open' });
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.jumper.set',
      params: { jumper: '3', position: '2-3' },
    });
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove_slot',
      params: { slot: '4' },
    });
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove_slot',
      params: { slot: '1' },
    });
    expect(dialogue().status).toBe('talking');
    act({
      type: 'INSTRUCT',
      callId: CALL,
      instructionId: 'i.ram.remove_slot',
      params: { slot: '2' },
    });
    expect(dialogue().outcome).toBe('resolved');
  });

  it('costs reputation when closed with a wrong code', () => {
    const { engine } = call('m.n01_03');
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-09' });
    expect(engine.getState().vars.reputation).toBe(-1);
  });
});

type Action = Parameters<ReturnType<typeof createEngine>['dispatch']>[0];

/** Plays actions on the current call, letting the caller finish typing after each one. */
function play(missionId: string, actions: ((callId: string) => Action)[]) {
  const ctx = call(missionId);
  for (const action of actions) {
    ctx.engine.dispatch(action(CALL));
    ctx.settle();
  }
  return ctx;
}

const ask = (questionId: string) => (callId: string) =>
  ({ type: 'ASK', callId, questionId }) as const;
const instruct = (instructionId: string, params?: Record<string, string>) => (callId: string) =>
  ({ type: 'INSTRUCT', callId, instructionId, ...(params ? { params } : {}) }) as const;
const consult = (pageId: string) => () => ({ type: 'CONSULT_PAGE', pageId }) as const;
const manage = (manageId: string) => (callId: string) =>
  ({ type: 'MANAGE', callId, manageId }) as const;

describe('Night 1 missions', () => {
  it('Signes bizarres: self-test, then SW1-5 on ON', () => {
    const { dialogue, engine } = play('m.n01_01', [
      ask('q.base.tried'),
      consult('p.20'),
      instruct('i.printer.selftest'),
      instruct('i.printer.dip', { switch: '6', position: 'ON' }),
      instruct('i.printer.dip', { switch: '5', position: 'OFF' }),
      instruct('i.printer.dip', { switch: '5', position: 'ON' }),
    ]);
    expect(dialogue().outcome).toBe('resolved');
    engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-03' });
    expect(engine.getState().vars.reputation).toBe(1);
  });

  it('Disque non formaté: SETUP then 1.44M; formatting erases the thesis', () => {
    const fixed = play('m.n01_02', [
      consult('p.24'),
      ask('q.floppy.clock'),
      instruct('i.setup.drive_a', { type: '1.44M' }),
      instruct('i.setup.enter'),
      instruct('i.setup.drive_a', { type: '720K' }),
      instruct('i.setup.drive_a', { type: '1.44M' }),
    ]);
    expect(fixed.dialogue().outcome).toBe('resolved');

    const erased = play('m.n01_02', [consult('p.24'), instruct('i.floppy.format')]);
    expect(erased.dialogue().outcome).toBe('hangup');
    expect(erased.engine.getState().flags).toContain('f.m02.thesis_erased');
  });

  it('Procédure 7-B: page 40 unlocked by the caller, R-14 dictated; another code raises suspicion', () => {
    const obeyed = play('m.n01_04', [
      ask('q.base.describe'),
      ask('q.m04.seven_b'),
      instruct('i.psu.replace'),
    ]);
    expect(obeyed.dialogue().outcome).toBe('resolved');
    obeyed.engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-14' });
    expect(obeyed.engine.getState().flags).toContain('f.n01.r14_sent');
    expect(obeyed.engine.getState().vars.suspicion).toBe(0);

    const refused = play('m.n01_04', [manage('g.wait'), instruct('i.psu.replace')]);
    refused.engine.dispatch({ type: 'CLOSE_TICKET', ticketId: 'ticket-1', code: 'R-18' });
    expect(refused.engine.getState().vars.suspicion).toBe(1);
  });
});

describe('Night 1 from boot to report', () => {
  it('rings the four calls in order, delivers three e-mails, ends with a report', () => {
    const clock = new ManualClock();
    const engine = createEngine({ clock, content });
    const tick = (ms: number) => {
      clock.advance(ms);
      engine.update();
    };
    const skip = () => {
      engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: 1000 });
      tick(1000);
      tick(1);
    };
    engine.dispatch({ type: 'START_SHIFT', operatorName: 'Test' });
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    const missions: string[] = [];
    for (let i = 0; i < 4; i++) {
      skip();
      const ringing = engine.getState().phone.lines.find((l) => l.status === 'ringing');
      missions.push(ringing?.call?.missionId ?? '');
      engine.dispatch({ type: 'ANSWER_CALL', line: ringing?.id ?? 1 });
      tick(2 * 60_000);
      engine.dispatch({ type: 'HANG_UP', line: ringing?.id ?? 1 });
      for (const ticket of engine.getState().tickets) {
        if (ticket.status === 'awaiting_closure') {
          engine.dispatch({ type: 'CLOSE_TICKET', ticketId: ticket.id, code: 'R-18' });
        }
      }
    }
    expect(missions).toEqual(['m.n01_01', 'm.n01_02', 'm.n01_03', 'm.n01_04']);
    for (let i = 0; i < 5 && engine.getState().night?.status === 'running'; i++) skip();
    expect(engine.getState().inbox.map((e) => e.id)).toEqual([
      'e.n01.kessler_accueil',
      'e.n01.si_compte_marc',
      'e.n01.inconnu',
    ]);
    expect(engine.getState().night?.status).toBe('ended');
    expect(engine.getState().report).toMatchObject({ callsAnswered: 4, ticketsClosed: 4 });
  });
});
