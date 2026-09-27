import { describe, expect, it } from 'vitest';
import { TYPING } from '../config.ts';
import { typingMs } from './typing.ts';

describe('typing rhythm', () => {
  const short = 'Oui.';
  const medium = 'Mon ordinateur fait trois bips.';

  it('takes longer for longer messages, within bounds', () => {
    expect(typingMs(medium, 1, 0)).toBeGreaterThan(typingMs(short, 1, 0));
    expect(typingMs(short, 1, 0)).toBeGreaterThanOrEqual(TYPING.minMs);
    expect(typingMs('x'.repeat(500), 1, 0)).toBe(TYPING.maxMs);
  });

  it('follows the caller typing speed', () => {
    expect(typingMs(medium, 2, 0)).toBeLessThan(typingMs(medium, 1, 0));
  });

  it('types faster when panicked, slower when relaxed', () => {
    expect(typingMs(medium, 1, -2)).toBeLessThan(typingMs(medium, 1, 0));
    expect(typingMs(medium, 1, 2)).toBeGreaterThan(typingMs(medium, 1, 0));
  });
});
