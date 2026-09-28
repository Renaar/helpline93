import type { ContentBundle } from '../content/schemas.ts';
import type { EngineAction } from './actions.ts';
import type { Clock } from './clock.ts';
import { OPERATOR_NAME_MAX_LENGTH, SHIFT_START, type LineId } from './config.ts';
import { randomDebugNumber } from './debugCalls.ts';
import { EMPTY_CONTENT } from './emptyContent.ts';
import { createDialogueSystem, type DialogueSystem } from './dialogue/system.ts';
import { createNightSystem } from './night/system.ts';
import { EventBus } from './eventBus.ts';
import type { EngineEvent, EngineEventMap, EventWithoutTime } from './events.ts';
import {
  type CallType,
  answerLine,
  findLine,
  firstIdleLine,
  hangUpLine,
  holdLine,
  resumeLine,
  ringLine,
  type PhoneState,
} from './phone.ts';
import { createRng, type Rng } from './rng.ts';
import { Scheduler } from './scheduler.ts';
import { canSkip, nextEventMinute } from './schedule.ts';
import { fastForwardEnded, minuteAt, parseClockTime, startFastForward } from './shift.ts';
import { createInitialState, type GameState } from './state.ts';

export interface EngineOptions {
  clock: Clock;
  seed?: number;
  /** Validated game content (GDD 7). Empty by default (tests of the phone, the clock…). */
  content?: ContentBundle;
}

export interface Engine {
  readonly events: EventBus<EngineEventMap>;
  readonly rng: Rng;
  readonly content: ContentBundle;
  /** Current game clock time (ms), e.g. to show how long a call has lasted. */
  now: () => number;
  /** Option index and helpers of the dialogue system (read-only use by the UI). */
  readonly dialogue: Pick<DialogueSystem, 'index'>;
  getState: () => Readonly<GameState>;
  dispatch: (action: EngineAction) => void;
  /** Advances time-based state and emits due events. Call it every frame. */
  update: () => void;
  /** Called after every state change (for UI bindings such as useSyncExternalStore). */
  subscribe: (listener: () => void) => () => void;
}

const DEFAULT_SEED = 1993;

export function createEngine({
  clock,
  seed = DEFAULT_SEED,
  content = EMPTY_CONTENT,
}: EngineOptions): Engine {
  const events = new EventBus<EngineEventMap>();
  const scheduler = new Scheduler<EngineEvent>();
  const listeners = new Set<() => void>();
  const rng = createRng(seed);
  let state = createInitialState(seed, parseClockTime(SHIFT_START));
  let pingCounter = 0;
  let callCounter = 0;

  function setState(next: GameState): void {
    if (next === state) return;
    state = next;
    for (const listener of [...listeners]) listener();
  }

  function setPhone(phone: PhoneState): void {
    setState({ ...state, phone });
  }

  function emitNow(event: EventWithoutTime, at = clock.now()): void {
    events.emit({ ...event, at });
  }

  function lineOf(callId: string): LineId | null {
    return state.phone.lines.find((line) => line.call?.id === callId)?.id ?? null;
  }

  function endLine(line: LineId): void {
    const result = hangUpLine(state.phone, line, state.shift.minute);
    if (!result) return;
    setPhone(result.phone);
    emitNow({ type: 'call.ended', payload: { record: result.record } });
    nights.onCallEnded(result.record.missionId, result.record.endedAt);
  }

  function scheduleCall(atMinute: number, type: CallType, missionId: string | null): void {
    callCounter += 1;
    const call = { id: `call-${callCounter}`, atMinute, type, missionId };
    setState({ ...state, upcomingCalls: [...state.upcomingCalls, call] });
    emitNow({
      type: 'call.scheduled',
      payload: { callId: call.id, atMinute: call.atMinute, callType: call.type },
    });
  }

  const nights = createNightSystem({
    content,
    getState: () => state,
    setState,
    emit: emitNow,
    scheduleCall: (missionId, atMinute, callType) => {
      scheduleCall(atMinute, callType, missionId);
    },
  });

  const dialogues: DialogueSystem = createDialogueSystem({
    clock,
    rng,
    content,
    getState: () => state,
    setState,
    emit: emitNow,
    hangUp: (callId) => {
      const line = lineOf(callId);
      if (line !== null) endLine(line);
    },
  });

  function callIdOn(line: LineId): string {
    return findLine(state.phone, line)?.call?.id ?? '';
  }

  /** Rings the first free line. Returns false when every line is busy. */
  function ring(callId: string, type: CallType, missionId: string | null): boolean {
    const line = firstIdleLine(state.phone);
    if (line === null) return false;
    const mission = missionId === null ? undefined : content.missions[missionId];
    const phone = mission && content.callers[mission.caller]?.phone;
    const call = {
      id: callId,
      number: phone ?? randomDebugNumber(rng),
      type,
      missionId: mission ? mission.id : null,
      ringingSince: state.shift.minute,
      answeredAt: null,
      answeredAtMs: null,
    };
    const next = ringLine(state.phone, line, call);
    if (!next) return false;
    setPhone(next);
    emitNow({
      type: 'call.incoming',
      payload: { callId: call.id, line, number: call.number, callType: call.type },
    });
    return true;
  }

  function dispatch(action: EngineAction): void {
    const minute = state.shift.minute;
    switch (action.type) {
      case 'START': {
        if (state.started) return;
        setState({ ...state, started: true });
        emitNow({ type: 'engine.started', payload: { seed } });
        return;
      }
      case 'START_SHIFT': {
        const operatorName = action.operatorName.trim().slice(0, OPERATOR_NAME_MAX_LENGTH);
        if (state.shift.startedAt !== null || operatorName === '') return;
        setState({ ...state, operatorName, shift: { ...state.shift, startedAt: clock.now() } });
        emitNow({ type: 'shift.started', payload: { operatorName, minute } });
        return;
      }
      case 'DEBUG_INCOMING_CALL': {
        callCounter += 1;
        const mission = action.missionId ? content.missions[action.missionId] : undefined;
        ring(
          `call-${callCounter}`,
          action.callType ?? mission?.type ?? 'libre',
          mission?.id ?? null,
        );
        return;
      }
      case 'SCHEDULE_CALL': {
        const mission = action.missionId ? content.missions[action.missionId] : undefined;
        scheduleCall(
          action.atMinute,
          action.callType ?? mission?.type ?? 'libre',
          mission?.id ?? null,
        );
        return;
      }
      case 'START_NIGHT':
        if (state.shift.startedAt === null) return;
        nights.start(action.nightId, action.carry);
        return;
      case 'READ_EMAIL':
        nights.readEmail(action.emailId);
        return;
      case 'SKIP_TO_NEXT_EVENT': {
        const target = nextEventMinute(state);
        if (!canSkip(state) || target === null) return;
        const fromMinute = state.shift.minute;
        setState({
          ...state,
          shift: startFastForward(state.shift, clock.now(), target, action.durationMs),
        });
        emitNow({
          type: 'shift.skipStarted',
          payload: { fromMinute, toMinute: target, durationMs: action.durationMs },
        });
        return;
      }
      case 'ANSWER_CALL': {
        const result = answerLine(state.phone, action.line, minute, clock.now());
        if (!result) return;
        setPhone(result.phone);
        if (result.held !== null) dialogues.onHold(callIdOn(result.held));
        const call = findLine(state.phone, action.line)?.call;
        emitNow({
          type: 'call.answered',
          payload: { callId: call?.id ?? '', line: action.line, held: result.held },
        });
        if (call?.missionId) dialogues.start(call.id, call.missionId, action.line, call.number);
        return;
      }
      case 'HOLD_CALL': {
        const phone = holdLine(state.phone, action.line);
        if (!phone) return;
        setPhone(phone);
        const callId = callIdOn(action.line);
        emitNow({ type: 'call.held', payload: { callId, line: action.line } });
        dialogues.onHold(callId);
        return;
      }
      case 'RESUME_CALL': {
        const result = resumeLine(state.phone, action.line);
        if (!result) return;
        setPhone(result.phone);
        if (result.held !== null) dialogues.onHold(callIdOn(result.held));
        const callId = callIdOn(action.line);
        emitNow({
          type: 'call.resumed',
          payload: { callId, line: action.line, held: result.held },
        });
        dialogues.onResume(callId);
        return;
      }
      case 'HANG_UP': {
        const callId = callIdOn(action.line);
        const before = state.phone;
        endLine(action.line);
        if (state.phone !== before) dialogues.onHangUp(callId);
        return;
      }
      case 'CONSULT_PAGE':
        dialogues.consultPage(action.pageId);
        return;
      case 'ASK':
        dialogues.reply(action.callId, 'ask', action.questionId);
        return;
      case 'INSTRUCT':
        dialogues.reply(action.callId, 'instruct', action.instructionId, action.params);
        return;
      case 'MANAGE':
        dialogues.reply(action.callId, 'manage', action.manageId);
        return;
      case 'CAPTURE':
        dialogues.capture(action.callId, action.captureId);
        return;
      case 'CLOSE_TICKET':
        dialogues.closeTicket(action.ticketId, action.code);
        return;
      case 'DEBUG_PING': {
        const requestedAt = clock.now();
        const at = requestedAt + Math.max(0, action.delayMs);
        pingCounter += 1;
        scheduler.schedule(at, {
          type: 'debug.pong',
          at,
          payload: { requestId: pingCounter, requestedAt },
        });
        return;
      }
    }
  }

  function updateShiftClock(): void {
    const now = clock.now();
    if (state.shift.startedAt === null) return;
    const skipDone = fastForwardEnded(state.shift, now);
    const shift = skipDone ? { ...state.shift, fastForward: null } : state.shift;
    const minute = minuteAt(shift, now);
    if (shift !== state.shift || minute !== shift.minute) {
      setState({ ...state, shift: { ...shift, minute } });
    }
    if (minute !== shift.minute) emitNow({ type: 'shift.minute', payload: { minute } });
    if (skipDone) emitNow({ type: 'shift.skipEnded', payload: { minute } });
  }

  /** Rings planned calls whose minute has come (they wait if every line is busy). */
  function ringDueCalls(): void {
    if (state.shift.fastForward !== null) return;
    for (const call of state.upcomingCalls) {
      if (call.atMinute > state.shift.minute) continue;
      if (!ring(call.id, call.type, call.missionId)) return;
      setState({ ...state, upcomingCalls: state.upcomingCalls.filter((c) => c.id !== call.id) });
    }
  }

  function update(): void {
    updateShiftClock();
    nights.update();
    ringDueCalls();
    dialogues.update(clock.now());
    for (const { item } of scheduler.popDue(clock.now())) events.emit(item);
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    events,
    rng,
    content,
    now: () => clock.now(),
    dialogue: { index: dialogues.index },
    getState: () => state,
    dispatch,
    update,
    subscribe,
  };
}
