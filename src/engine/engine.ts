import type { EngineAction } from './actions.ts';
import type { Clock } from './clock.ts';
import { OPERATOR_NAME_MAX_LENGTH, SHIFT_START, type LineId } from './config.ts';
import { randomDebugNumber } from './debugCalls.ts';
import { EventBus } from './eventBus.ts';
import type { EngineEvent, EngineEventMap } from './events.ts';
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
}

export interface Engine {
  readonly events: EventBus<EngineEventMap>;
  readonly rng: Rng;
  getState: () => Readonly<GameState>;
  dispatch: (action: EngineAction) => void;
  /** Advances time-based state and emits due events. Call it every frame. */
  update: () => void;
  /** Called after every state change (for UI bindings such as useSyncExternalStore). */
  subscribe: (listener: () => void) => () => void;
}

const DEFAULT_SEED = 1993;

type EventWithoutTime = { [E in EngineEvent as E['type']]: Omit<E, 'at'> }[EngineEvent['type']];

export function createEngine({ clock, seed = DEFAULT_SEED }: EngineOptions): Engine {
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

  function emitNow(event: EventWithoutTime): void {
    events.emit({ ...event, at: clock.now() });
  }

  function callIdOn(line: LineId): string {
    return findLine(state.phone, line)?.call?.id ?? '';
  }

  /** Rings the first free line. Returns false when every line is busy. */
  function ring(callId: string, type: CallType): boolean {
    const line = firstIdleLine(state.phone);
    if (line === null) return false;
    const call = {
      id: callId,
      number: randomDebugNumber(rng),
      type,
      ringingSince: state.shift.minute,
      answeredAt: null,
    };
    const phone = ringLine(state.phone, line, call);
    if (!phone) return false;
    setPhone(phone);
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
        ring(`call-${callCounter}`, action.callType ?? 'libre');
        return;
      }
      case 'SCHEDULE_CALL': {
        callCounter += 1;
        const call = {
          id: `call-${callCounter}`,
          atMinute: action.atMinute,
          type: action.callType ?? 'libre',
        };
        setState({ ...state, upcomingCalls: [...state.upcomingCalls, call] });
        emitNow({
          type: 'call.scheduled',
          payload: { callId: call.id, atMinute: call.atMinute, callType: call.type },
        });
        return;
      }
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
        const result = answerLine(state.phone, action.line, minute);
        if (!result) return;
        setPhone(result.phone);
        emitNow({
          type: 'call.answered',
          payload: { callId: callIdOn(action.line), line: action.line, held: result.held },
        });
        return;
      }
      case 'HOLD_CALL': {
        const phone = holdLine(state.phone, action.line);
        if (!phone) return;
        setPhone(phone);
        emitNow({
          type: 'call.held',
          payload: { callId: callIdOn(action.line), line: action.line },
        });
        return;
      }
      case 'RESUME_CALL': {
        const result = resumeLine(state.phone, action.line);
        if (!result) return;
        setPhone(result.phone);
        emitNow({
          type: 'call.resumed',
          payload: { callId: callIdOn(action.line), line: action.line, held: result.held },
        });
        return;
      }
      case 'HANG_UP': {
        const result = hangUpLine(state.phone, action.line, minute);
        if (!result) return;
        setPhone(result.phone);
        emitNow({ type: 'call.ended', payload: { record: result.record } });
        return;
      }
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
      if (!ring(call.id, call.type)) return;
      setState({ ...state, upcomingCalls: state.upcomingCalls.filter((c) => c.id !== call.id) });
    }
  }

  function update(): void {
    updateShiftClock();
    ringDueCalls();
    for (const { item } of scheduler.popDue(clock.now())) events.emit(item);
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { events, rng, getState: () => state, dispatch, update, subscribe };
}
