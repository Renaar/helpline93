import { describe, expect, it } from 'vitest';
import { formatClock, formatPhoneNumber } from './format.ts';

describe('formatClock', () => {
  it('formats shift minutes as a 24 h clock, wrapping after midnight', () => {
    expect(formatClock(1320)).toBe('22:00');
    expect(formatClock(1334)).toBe('22:14');
    expect(formatClock(1440 + 65)).toBe('01:05');
  });
});

describe('formatPhoneNumber', () => {
  it('formats ten digits US style', () => {
    expect(formatPhoneNumber('2135550142')).toBe('(213) 555-0142');
  });

  it('leaves anything else untouched', () => {
    expect(formatPhoneNumber('911')).toBe('911');
  });
});
