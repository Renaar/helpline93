import { MOOD_MAX, MOOD_MIN, type Effect } from '../../content/schemas.ts';
import type { NarrativeVars } from '../state.ts';

/** `+1` / `-2` add, `"=0"` sets. */
export function applyVarChange(value: number, change: number | string): number {
  if (typeof change === 'number') return value + change;
  return Number(change.replace('=', '').trim());
}

export function applyVars(vars: NarrativeVars, changes: Effect['vars']): NarrativeVars {
  if (!changes) return vars;
  const next = { ...vars };
  for (const [name, change] of Object.entries(changes)) {
    const key = name as keyof NarrativeVars;
    next[key] = applyVarChange(next[key], change);
  }
  return next;
}

export function applyFlags(flags: readonly string[], effect: Effect): string[] {
  const cleared = flags.filter((flag) => !(effect.clear_flags ?? []).includes(flag));
  const added = (effect.set_flags ?? []).filter((flag) => !cleared.includes(flag));
  return [...cleared, ...added];
}

export function clampMood(mood: number): number {
  return Math.min(MOOD_MAX, Math.max(MOOD_MIN, mood));
}
