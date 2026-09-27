import type { Line } from '../../engine/phone.ts';
import type { GameState } from '../../engine/state.ts';

/** The call the operator is dealing with: the active line, else the first line on hold. */
export function currentCallLine(state: GameState): Line | undefined {
  const lines = state.phone.lines;
  return lines.find((l) => l.status === 'active') ?? lines.find((l) => l.status === 'held');
}
