import type { Condition } from '../../content/schemas.ts';
import type { NarrativeVars } from '../state.ts';

/** What a `when` can look at (GDD 7.7). */
export interface ConditionContext {
  flags: readonly string[];
  captured: readonly string[];
  asked: readonly string[];
  done: readonly string[];
  /** Parameters of the instruction being answered, if any. */
  params: Readonly<Record<string, string>>;
  mood: number;
  vars: NarrativeVars;
}

const COMPARISON = /^(<=|>=|<|>|==|=)?\s*(-?\d+)$/;

/** `compare(0, "<=0")` → true. A bare number means equality. */
export function compare(value: number, comparison: number | string): boolean {
  if (typeof comparison === 'number') return value === comparison;
  const match = COMPARISON.exec(comparison.trim());
  if (!match) return false;
  const target = Number(match[2]);
  switch (match[1]) {
    case '<=':
      return value <= target;
    case '>=':
      return value >= target;
    case '<':
      return value < target;
    case '>':
      return value > target;
    default:
      return value === target;
  }
}

const includesAll = (list: readonly string[], wanted: readonly string[] | undefined) =>
  (wanted ?? []).every((item) => list.includes(item));

/** Every listed condition must hold; no condition at all always holds. */
export function conditionHolds(when: Condition | undefined, context: ConditionContext): boolean {
  if (!when) return true;
  if (!includesAll(context.flags, when.flags_all)) return false;
  if ((when.flags_none ?? []).some((flag) => context.flags.includes(flag))) return false;
  if (!includesAll(context.captured, when.captured)) return false;
  if (!includesAll(context.asked, when.asked)) return false;
  if (!includesAll(context.done, when.done)) return false;
  for (const [name, value] of Object.entries(when.param ?? {})) {
    if (context.params[name] !== String(value)) return false;
  }
  if (when.mood !== undefined && !compare(context.mood, when.mood)) return false;
  for (const [name, comparison] of Object.entries(when.vars ?? {})) {
    if (!compare(context.vars[name as keyof NarrativeVars], comparison)) return false;
  }
  return true;
}
