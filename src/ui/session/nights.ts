import type { Night } from '../../content/schemas.ts';
import { engine } from '../engine/runtime.ts';
import { loadedSave } from './saveGame.ts';

/** Nights the player may start: the first one, and every night reached in the save. */
export function playableNights(): Night[] {
  const reached = loadedSave()?.nights ?? {};
  return engine.content.nights.filter((night, index) => index === 0 || night.id in reached);
}

/** Starts a night with what the save hands over to it (nothing for the first night). */
export function startNight(nightId: string): void {
  const carry = loadedSave()?.nights[nightId];
  engine.dispatch({ type: 'START_NIGHT', nightId, ...(carry ? { carry } : {}) });
}

/** "n.01" → 1 */
export function nightNumber(night: Pick<Night, 'id'>): number {
  return Number(night.id.slice(2));
}
