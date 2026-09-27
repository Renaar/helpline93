import type { Rng } from './rng.ts';

/**
 * Debug caller numbers, in the range reserved for fiction (555-0100 to 555-0199).
 * Real callers come from content/ in J2.
 */
export function randomDebugNumber(rng: Rng): string {
  const area = 200 + Math.floor(rng() * 700);
  const suffix = 100 + Math.floor(rng() * 100);
  return `${area}5550${suffix}`;
}
