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
