import type { Caller, Effect, ManageOption, Message, Mission } from '../../content/schemas.ts';
import type { Rng } from '../rng.ts';
import { conditionHolds, type ConditionContext } from './conditions.ts';

export type ResponseKind = 'mission' | 'repeat' | 'manage' | 'irrelevant';

export interface ResolvedResponse {
  kind: ResponseKind;
  say: Message[];
  then: Effect | undefined;
}

/** One line among alternatives, avoiding the line said just before when possible. */
export function pickLine(lines: readonly Message[], rng: Rng, avoid?: string): Message[] {
  const text = (m: Message) => (typeof m === 'string' ? m : m.text);
  const choices = lines.length > 1 ? lines.filter((line) => text(line) !== avoid) : lines;
  const line = choices[Math.floor(rng() * choices.length)];
  return line === undefined ? [] : [line];
}

/**
 * Chooses the caller's answer (GDD 7.1 / 7.7). Never a dead end:
 * 1. the first mission entry whose `when` holds — on a repeat, only entries with a `when`;
 * 2. a GÉRER option: the caller's reaction, plus the option's default effect the first time;
 * 3. a repeat: the caller's "already said" line;
 * 4. otherwise: an "irrelevant" line.
 */
export function resolveResponse(args: {
  mission: Mission;
  caller: Caller;
  optionId: string;
  manage: ManageOption | undefined;
  repeated: boolean;
  context: ConditionContext;
  rng: Rng;
  lastCallerLine?: string;
}): ResolvedResponse {
  const { mission, caller, optionId, manage, repeated, context, rng, lastCallerLine } = args;
  const entries = mission.responses[optionId] ?? [];
  const candidates = repeated ? entries.filter((entry) => entry.when) : entries;
  const match = candidates.find((entry) => conditionHolds(entry.when, context));
  if (match) return { kind: 'mission', say: match.say, then: match.then };

  if (manage) {
    const lines = caller.fallback.manage?.[manage.id] ?? caller.fallback.irrelevant;
    return {
      kind: 'manage',
      say: pickLine(lines, rng, lastCallerLine),
      then: repeated ? undefined : manage.then,
    };
  }
  const lines = repeated ? caller.fallback.repeat : caller.fallback.irrelevant;
  return {
    kind: repeated ? 'repeat' : 'irrelevant',
    say: pickLine(lines, rng, lastCallerLine),
    then: undefined,
  };
}
