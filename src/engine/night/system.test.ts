import { describe, expect, it } from 'vitest';
import { ManualClock } from '../clock.ts';
import { GAME_MINUTE_MS } from '../config.ts';
import { testContent } from '../dialogue/testContent.ts';
import { createEngine } from '../engine.ts';
import type { EngineEvent } from '../events.ts';
import { canSkip, nextEventMinute } from '../schedule.ts';
import { shiftMinuteOf } from './clock.ts';
import { carryOver, nextNightId } from './system.ts';

function setup() {
  const clock = new ManualClock();
  const engine = createEngine({ clock, seed: 3, content: testContent });
  const log: EngineEvent[] = [];
  engine.events.onAny((e) => log.push(e));
  engine.dispatch({ type: 'START_SHIFT', operatorName: 'Alex' });
  const tick = (ms = 100) => {
    clock.advance(ms);
    engine.update();
  };
  /** Jumps to the next event (as the Phone button does) and lets the jump finish. */
  const skip = () => {
    engine.dispatch({ type: 'SKIP_TO_NEXT_EVENT', durationMs: 1000 });
    tick(1000);
    tick(1);
  };
  const settle = () => {
    for (let i = 0; i < 400; i++) tick(100);
  };
  return { clock, engine, log, tick, skip, settle, state: () => engine.getState() };
}

describe('night clock', () => {
  it('places times after midnight on the next morning', () => {
    expect(shiftMinuteOf('22:20', 1320)).toBe(1340);
    expect(shiftMinuteOf('04:10', 1320)).toBe(1690);
    expect(shiftMinuteOf('06:00', 1320)).toBe(1800);
  });
});

describe('night planner', () => {
  it('starts a night: boot e-mails, timed events and the first call', () => {
    const { engine, log, state } = setup();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    expect(state().night).toMatchObject({ id: 'n.01', status: 'running', endMinute: 1800 });
    expect(state().inbox).toEqual([{ id: 'e.t.boot', minute: 1320, read: false }]);
    expect(state().emails).toEqual([{ id: 'e.t.late', atMinute: 1690 }]);
    expect(state().upcomingCalls).toEqual([
      expect.objectContaining({ atMinute: 1340, missionId: 'm.n01_01' }),
    ]);
    expect(log.map((e) => e.type)).toEqual(
      expect.arrayContaining(['night.started', 'email.received', 'call.scheduled']),
    );
  });

  it('refuses to start before login, twice, or an unknown night', () => {
    const early = createEngine({ clock: new ManualClock(), content: testContent });
    early.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    expect(early.getState().night).toBeNull();
    const { engine, state } = setup();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.99' });
    expect(state().night).toBeNull();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    expect(state().upcomingCalls).toHaveLength(1);
  });

  it('plans `after_previous` once the previous call has ended, and skips a failed `when`', () => {
    const { engine, skip, tick, state } = setup();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    skip();
    expect(state().shift.minute).toBe(1340);
    expect(state().phone.lines[0]?.status).toBe('ringing');
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    tick(3 * GAME_MINUTE_MS);
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    // Ended at 22:23 → the second call rings 15 min later; the third never (its `when` fails).
    expect(state().upcomingCalls).toEqual([
      expect.objectContaining({ atMinute: 1358, missionId: 'm.n01_02' }),
    ]);
    expect(state().night?.allPlanned).toBe(false);
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    expect(state().upcomingCalls).toEqual([]);
    expect(state().night?.allPlanned).toBe(true);
    expect(state().night?.endedAt).toMatchObject({ 'm.n01_02': 1358, 'm.n01_04': 1358 });
  });

  it('plans a conditional call when its `when` holds', () => {
    const { engine, state, skip } = setup();
    engine.dispatch({
      type: 'START_NIGHT',
      nightId: 'n.01',
      carry: {
        vars: { reputation: 2, suspicion: 0, awareness: 0 },
        flags: ['f.t.never'],
        trust: {},
      },
    });
    expect(state().vars.reputation).toBe(2);
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    expect(state().upcomingCalls).toEqual([
      expect.objectContaining({ atMinute: 1360, missionId: 'm.n01_04', type: 'urgent' }),
    ]);
  });

  it('delivers timed e-mails and marks them read', () => {
    const { engine, state, skip, log } = setup();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    engine.dispatch({ type: 'READ_EMAIL', emailId: 'e.t.boot' });
    expect(state().inbox[0]?.read).toBe(true);
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    // Tickets must be closed before anything else.
    for (const ticket of state().tickets) {
      engine.dispatch({ type: 'CLOSE_TICKET', ticketId: ticket.id, code: 'R-09' });
    }
    expect(nextEventMinute(state())).toBe(1690);
    skip();
    expect(state().inbox.map((e) => e.id)).toEqual(['e.t.boot', 'e.t.late']);
    expect(log.filter((e) => e.type === 'email.received')).toHaveLength(2);
  });

  it('ends the night only once every ticket is closed, with a report', () => {
    const { engine, state, skip, log, tick } = setup();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    tick(4 * GAME_MINUTE_MS);
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    skip();
    engine.dispatch({ type: 'ANSWER_CALL', line: 1 });
    tick(2 * GAME_MINUTE_MS);
    engine.dispatch({ type: 'HANG_UP', line: 1 });
    const [first, second] = state().tickets;
    engine.dispatch({ type: 'CLOSE_TICKET', ticketId: first?.id ?? '', code: 'R-07' });
    skip(); // the 04:10 e-mail
    expect(nextEventMinute(state())).toBe(1800);
    expect(canSkip(state())).toBe(false);
    engine.dispatch({ type: 'CLOSE_TICKET', ticketId: second?.id ?? '', code: 'R-09' });
    expect(canSkip(state())).toBe(true);
    skip();
    expect(state().night?.status).toBe('ended');
    expect(log.at(-1)?.type).toBe('night.ended');
    expect(state().report).toMatchObject({
      nightId: 'n.01',
      callsAnswered: 2,
      ticketsClosed: 2,
      ticketsLeftOpen: 0,
      averageCallMinutes: 3,
    });
    expect(state().report?.log.map((l) => l.code)).toEqual(['R-07', 'R-09']);
  });

  it('hands vars, flags and trust over to the next night', () => {
    const { engine, state } = setup();
    engine.dispatch({ type: 'START_NIGHT', nightId: 'n.01' });
    expect(carryOver(state())).toEqual({
      vars: { reputation: 0, suspicion: 0, awareness: 0 },
      flags: [],
      trust: {},
    });
    expect(nextNightId(testContent, 'n.01')).toBeNull();
  });
});
