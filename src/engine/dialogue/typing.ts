import { TYPING } from '../config.ts';
import { clampMood } from './effects.ts';

/** How long the caller types a message, in ms (GDD 4.2.5). */
export function typingMs(text: string, typingSpeed: number, mood: number): number {
  const key = String(clampMood(Math.round(mood))) as keyof typeof TYPING.moodFactor;
  const raw =
    ((TYPING.baseMs + text.length * TYPING.perCharacterMs) / typingSpeed) * TYPING.moodFactor[key];
  return Math.round(Math.min(TYPING.maxMs, Math.max(TYPING.minMs, raw)));
}
