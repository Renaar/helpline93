import { indexOptions } from '../../content/options.ts';
import type { ContentBundle, Effect, Message, Mission } from '../../content/schemas.ts';
import { captureIdsIn, messageText } from '../../content/tags.ts';
import type { Clock } from '../clock.ts';
import { TICKET_FIRST_NUMBER, TYPING, type LineId } from '../config.ts';
import type { EventWithoutTime } from '../events.ts';
import type { Rng } from '../rng.ts';
import { Scheduler } from '../scheduler.ts';
import type { GameState } from '../state.ts';
import { conditionHolds, type ConditionContext } from './conditions.ts';
import { applyFlags, applyVars, clampMood } from './effects.ts';
import { acceptParams, actionKey, availableOptions, fillPlaceholders } from './options.ts';
import { pickLine, resolveResponse } from './resolve.ts';
import type { Dialogue, DialogueOutcome, Ticket, TranscriptEntry, Verb } from './types.ts';
import { typingMs } from './typing.ts';

/** What the dialogue system needs from the engine. */
export interface DialogueHost {
  clock: Clock;
  rng: Rng;
  content: ContentBundle;
  getState: () => GameState;
  setState: (state: GameState) => void;
  emit: (event: EventWithoutTime, at?: number) => void;
  /** Hangs up the line carrying this call (the caller ended it). */
  hangUp: (callId: string) => void;
}

type Task =
  | { kind: 'typing'; callId: string }
  | { kind: 'say'; callId: string; text: string }
  | { kind: 'end'; callId: string; outcome: DialogueOutcome };

/** Can the operator send a reply on this call right now? */
export function canReply(state: GameState, callId: string): boolean {
  const dialogue = state.dialogues[callId];
  if (dialogue?.status !== 'talking' || dialogue.pending > 0) return false;
  return state.phone.lines.some((line) => line.status === 'active' && line.call?.id === callId);
}

/**
 * Conversations (GDD 4.2), tickets (4.3) and clues (4.7).
 * State lives in GameState; only the timing of upcoming caller messages is kept here.
 */
export function createDialogueSystem(host: DialogueHost) {
  const { clock, rng, content } = host;
  const index = indexOptions(content);
  const tasks = new Scheduler<Task>();
  /** When the caller's last queued message will be delivered, by call. */
  const queueEnd = new Map<string, number>();

  const state = () => host.getState();

  function patchDialogue(callId: string, patch: (d: Dialogue) => Partial<Dialogue>): void {
    const current = state().dialogues[callId];
    if (!current) return;
    host.setState({
      ...state(),
      dialogues: { ...state().dialogues, [callId]: { ...current, ...patch(current) } },
    });
  }

  function patchTicket(ticketId: string, patch: (t: Ticket) => Partial<Ticket>): void {
    host.setState({
      ...state(),
      tickets: state().tickets.map((t) => (t.id === ticketId ? { ...t, ...patch(t) } : t)),
    });
  }

  function append(callId: string, entry: DistributiveOmit<TranscriptEntry, 'id' | 'minute'>) {
    let id = 0;
    patchDialogue(callId, (d) => {
      id = d.transcript.length + 1;
      const full = { ...entry, id, minute: state().shift.minute };
      return { transcript: [...d.transcript, full] };
    });
    return id;
  }

  function missionOf(dialogue: Dialogue): Mission | undefined {
    return content.missions[dialogue.missionId];
  }

  /** Queues the caller's messages with a realistic rhythm (GDD 4.2.5). */
  function queueReply(
    callId: string,
    say: readonly Message[],
    delayMs: number,
    endCall?: DialogueOutcome,
  ) {
    const dialogue = state().dialogues[callId];
    const caller = dialogue && content.callers[dialogue.callerId];
    if (!dialogue || !caller) return;
    const now = clock.now();
    let t = Math.max(now + delayMs, queueEnd.get(callId) ?? 0);
    say.forEach((message, i) => {
      const text = messageText(message);
      const pause = typeof message === 'string' ? 0 : (message.pause ?? 0) * 1000;
      const forced = typeof message === 'string' ? undefined : message.typing;
      const typing =
        forced === undefined ? typingMs(text, caller.typing_speed, dialogue.mood) : forced * 1000;
      const start = t + (i === 0 ? 0 : TYPING.messageGapMs) + pause;
      tasks.schedule(start, { kind: 'typing', callId });
      tasks.schedule(start + typing, { kind: 'say', callId, text });
      t = start + typing;
    });
    queueEnd.set(callId, t);
    if (say.length > 0) patchDialogue(callId, (d) => ({ pending: d.pending + say.length }));
    if (endCall)
      tasks.schedule(t + TYPING.endCallDelayMs, { kind: 'end', callId, outcome: endCall });
  }

  function unlockPage(callId: string, pageId: string): void {
    const dialogue = state().dialogues[callId];
    const page = content.pages.find((p) => p.id === pageId);
    if (dialogue?.status !== 'talking' || !page || dialogue.pages.includes(pageId)) return;
    if (page.questions.length === 0 && page.instructions.length === 0) return;
    patchDialogue(callId, (d) => ({ pages: [...d.pages, pageId] }));
    host.emit({
      type: 'options.unlocked',
      payload: {
        callId,
        pageId,
        questionIds: page.questions.map((q) => q.id),
        instructionIds: page.instructions.map((i) => i.id),
      },
    });
  }

  /** Flags, variables and e-mails: effects that outlive the call. */
  function applyGlobalEffect(effect: Effect): void {
    const s = state();
    const minute = s.shift.minute;
    const email = effect.email;
    host.setState({
      ...s,
      flags: applyFlags(s.flags, effect),
      vars: applyVars(s.vars, effect.vars),
      emails: email
        ? [...s.emails, { id: email.id, atMinute: minute + (email.delay ?? 0) }]
        : s.emails,
    });
    if (email) {
      host.emit({
        type: 'email.queued',
        payload: { emailId: email.id, atMinute: minute + (email.delay ?? 0) },
      });
    }
  }

  function applyEffect(callId: string, effect: Effect | undefined): void {
    if (!effect) return;
    applyGlobalEffect(effect);
    if (effect.mood !== undefined) {
      const change = effect.mood;
      patchDialogue(callId, (d) => ({ mood: clampMood(d.mood + change) }));
    }
    for (const id of effect.unlock ?? []) {
      if (id.startsWith('p.')) unlockPage(callId, id);
      else if (!state().dialogues[callId]?.localQuestions.includes(id)) {
        patchDialogue(callId, (d) => ({ localQuestions: [...d.localQuestions, id] }));
        host.emit({
          type: 'options.unlocked',
          payload: { callId, pageId: null, questionIds: [id], instructionIds: [] },
        });
      }
    }
  }

  function start(callId: string, missionId: string, line: LineId, phone: string): void {
    const mission = content.missions[missionId];
    const caller = mission && content.callers[mission.caller];
    if (!mission || !caller || callId in state().dialogues) return;
    const s = state();
    const ticket: Ticket = {
      id: `ticket-${s.tickets.length + 1}`,
      number: TICKET_FIRST_NUMBER + s.tickets.length,
      callId,
      missionId,
      line,
      phone,
      openedAt: s.shift.minute,
      fields: {},
      status: 'open',
      outcome: null,
      code: null,
      closedAt: null,
    };
    const dialogue: Dialogue = {
      callId,
      missionId,
      callerId: caller.id,
      ticketId: ticket.id,
      status: 'talking',
      outcome: null,
      mood: caller.mood_start,
      pages: [],
      localQuestions: [],
      asked: [],
      done: [],
      performed: [],
      captured: [],
      transcript: [],
      typing: false,
      pending: 0,
    };
    host.setState({
      ...s,
      dialogues: { ...s.dialogues, [callId]: dialogue },
      tickets: [...s.tickets, ticket],
    });
    host.emit({ type: 'dialogue.started', payload: { callId, missionId, ticketId: ticket.id } });
    host.emit({ type: 'ticket.opened', payload: { ticketId: ticket.id } });
    queueReply(callId, mission.opening, TYPING.openingDelayMs);
  }

  function end(callId: string, outcome: DialogueOutcome): void {
    const dialogue = state().dialogues[callId];
    if (dialogue?.status !== 'talking') return;
    append(callId, { from: 'system', event: 'ended' });
    patchDialogue(callId, () => ({ status: 'ended', outcome, typing: false, pending: 0 }));
    patchTicket(dialogue.ticketId, () => ({ status: 'awaiting_closure', outcome }));
    queueEnd.delete(callId);
    host.emit({ type: 'dialogue.ended', payload: { callId, outcome } });
  }

  /** DEMANDER / INSTRUIRE / GÉRER. Returns false when refused. */
  function reply(
    callId: string,
    verb: Verb,
    optionId: string,
    rawParams: Readonly<Record<string, string>> = {},
  ): boolean {
    const s = state();
    const dialogue = s.dialogues[callId];
    const mission = dialogue && missionOf(dialogue);
    const caller = dialogue && content.callers[dialogue.callerId];
    if (!dialogue || !mission || !caller || !canReply(s, callId)) return false;
    const option = availableOptions(content, index, dialogue)[verb].find((o) => o.id === optionId);
    if (!option) return false;
    const params = acceptParams(option.params, rawParams);
    if (!params) return false;

    const text = fillPlaceholders(option.text, params);
    const entryId = append(callId, { from: 'operator', verb, optionId, text });
    host.emit({ type: 'operator.message', payload: { callId, entryId, verb, optionId, text } });

    const key = actionKey(optionId, params);
    const context: ConditionContext = {
      flags: s.flags,
      captured: dialogue.captured,
      asked: dialogue.asked,
      done: dialogue.done,
      params,
      mood: dialogue.mood,
      vars: s.vars,
    };
    const lastCaller = dialogue.transcript.findLast((e) => e.from === 'caller');
    const response = resolveResponse({
      mission,
      caller,
      optionId,
      manage: verb === 'manage' ? index.manage.get(optionId)?.option : undefined,
      repeated: dialogue.performed.includes(key),
      context,
      rng,
      ...(lastCaller ? { lastCallerLine: lastCaller.text } : {}),
    });
    patchDialogue(callId, (d) => ({
      performed: d.performed.includes(key) ? d.performed : [...d.performed, key],
      asked: verb === 'ask' && !d.asked.includes(optionId) ? [...d.asked, optionId] : d.asked,
      done: verb === 'instruct' && !d.done.includes(optionId) ? [...d.done, optionId] : d.done,
    }));
    applyEffect(callId, response.then);
    queueReply(callId, response.say, TYPING.replyDelayMs, response.then?.end_call);
    return true;
  }

  function capture(callId: string, captureId: string): void {
    const s = state();
    const dialogue = s.dialogues[callId];
    const mission = dialogue && missionOf(dialogue);
    const definition = mission?.captures[captureId];
    const ticket = s.tickets.find((t) => t.id === dialogue?.ticketId);
    if (!dialogue || !mission || !definition || !ticket || ticket.status === 'closed') return;
    if (dialogue.captured.includes(captureId)) return;
    const said = dialogue.transcript.some(
      (e) => e.from === 'caller' && captureIdsIn(e.text).includes(captureId),
    );
    if (!said) return;
    patchDialogue(callId, (d) => ({ captured: [...d.captured, captureId] }));
    patchTicket(ticket.id, (t) => ({
      fields: {
        ...t.fields,
        [definition.field]: [...(t.fields[definition.field] ?? []), definition.label],
      },
    }));
    const next = state();
    host.setState({
      ...next,
      clues: [
        ...next.clues,
        {
          id: `${callId}/${captureId}`,
          captureId,
          callId,
          missionId: mission.id,
          label: definition.label,
          field: definition.field,
          keywords: definition.keywords,
          minute: next.shift.minute,
        },
      ],
    });
    host.emit({
      type: 'capture.added',
      payload: {
        callId,
        captureId,
        label: definition.label,
        field: definition.field,
        ticketId: ticket.id,
      },
    });
  }

  function consultPage(pageId: string): void {
    if (!content.pages.some((p) => p.id === pageId)) return;
    const s = state();
    if (!s.consultedPages.includes(pageId)) {
      host.setState({ ...s, consultedPages: [...s.consultedPages, pageId] });
      host.emit({ type: 'page.consulted', payload: { pageId } });
    }
    for (const dialogue of Object.values(state().dialogues)) unlockPage(dialogue.callId, pageId);
  }

  /** Closure by resolution code (GDD 4.3 / 7.7): the matching rule, else `default`. */
  function closeTicket(ticketId: string, code: string): void {
    const s = state();
    const ticket = s.tickets.find((t) => t.id === ticketId);
    const dialogue = ticket && s.dialogues[ticket.callId];
    const mission = ticket && content.missions[ticket.missionId];
    if (!ticket || !dialogue || !mission || ticket.status !== 'awaiting_closure') return;
    if (!content.codes.some((c) => c.id === code)) return;
    const context: ConditionContext = {
      flags: s.flags,
      captured: dialogue.captured,
      asked: dialogue.asked,
      done: dialogue.done,
      params: {},
      mood: dialogue.mood,
      vars: s.vars,
    };
    const rule = mission.closure.codes[code];
    const chosen =
      rule && conditionHolds(rule.when, context) ? rule : mission.closure.codes.default;
    if (chosen?.then) applyGlobalEffect(chosen.then);
    patchTicket(ticketId, () => ({ status: 'closed', code, closedAt: state().shift.minute }));
    host.emit({ type: 'ticket.closed', payload: { ticketId, code } });
  }

  function onHold(callId: string): void {
    const dialogue = state().dialogues[callId];
    const caller = dialogue && content.callers[dialogue.callerId];
    if (dialogue?.status !== 'talking' || !caller) return;
    append(callId, { from: 'system', event: 'held' });
    const last = dialogue.transcript.findLast((e) => e.from === 'caller');
    queueReply(callId, pickLine(caller.fallback.hold, rng, last?.text), TYPING.replyDelayMs);
  }

  function onResume(callId: string): void {
    if (state().dialogues[callId]?.status !== 'talking') return;
    append(callId, { from: 'system', event: 'resumed' });
  }

  /** The operator hung up: the conversation stops where it is. */
  function onHangUp(callId: string): void {
    end(callId, 'abandoned');
  }

  function update(now: number): void {
    for (const { at, item } of tasks.popDue(now)) {
      const dialogue = state().dialogues[item.callId];
      if (dialogue?.status !== 'talking') continue;
      if (item.kind === 'typing') {
        patchDialogue(item.callId, () => ({ typing: true }));
        host.emit({ type: 'caller.typing', payload: { callId: item.callId, typing: true } }, at);
      } else if (item.kind === 'say') {
        const entryId = append(item.callId, { from: 'caller', text: item.text });
        patchDialogue(item.callId, (d) => ({ typing: false, pending: Math.max(0, d.pending - 1) }));
        host.emit({ type: 'caller.typing', payload: { callId: item.callId, typing: false } }, at);
        host.emit(
          { type: 'caller.message', payload: { callId: item.callId, entryId, text: item.text } },
          at,
        );
      } else {
        end(item.callId, item.outcome);
        host.hangUp(item.callId);
      }
    }
  }

  return {
    index,
    start,
    reply,
    capture,
    consultPage,
    closeTicket,
    onHold,
    onResume,
    onHangUp,
    update,
  };
}

export type DialogueSystem = ReturnType<typeof createDialogueSystem>;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
