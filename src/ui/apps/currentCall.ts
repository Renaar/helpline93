import type { Dialogue } from '../../engine/dialogue/types.ts';
import type { Line } from '../../engine/phone.ts';
import type { GameState } from '../../engine/state.ts';

/** The call the operator is dealing with: the active line, else the first line on hold. */
export function currentCallLine(state: GameState): Line | undefined {
  const lines = state.phone.lines;
  return lines.find((l) => l.status === 'active') ?? lines.find((l) => l.status === 'held');
}

/**
 * The conversation shown in the chat: the current call's, else the last one (still readable,
 * and its information still capturable, until the next call).
 */
export function currentDialogue(state: GameState): Dialogue | undefined {
  const call = currentCallLine(state)?.call;
  if (call) return state.dialogues[call.id];
  return Object.values(state.dialogues).at(-1);
}
