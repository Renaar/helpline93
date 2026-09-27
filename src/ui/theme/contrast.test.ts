import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast.ts';
import { contrastPairs, palette } from './palette.ts';

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
    expect(contrastRatio('#FFFFFF', '#767676')).toBeCloseTo(4.54, 2);
  });
});

describe('palette', () => {
  it.each(contrastPairs.filter((pair) => pair.minimum > 0))(
    '$text on $background reaches $minimum:1',
    ({ text, background, minimum }) => {
      expect(contrastRatio(palette[text], palette[background])).toBeGreaterThanOrEqual(minimum);
    },
  );
});
