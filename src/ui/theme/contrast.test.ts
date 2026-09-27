import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast.ts';
import { contrastPairs, palettes } from './palette.ts';

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
    expect(contrastRatio('#FFFFFF', '#767676')).toBeCloseTo(4.54, 2);
  });
});

describe('copper palette', () => {
  it.each(contrastPairs.filter((pair) => pair.minimum > 0))(
    '$text on $background reaches $minimum:1',
    ({ text, background, minimum }) => {
      const ratio = contrastRatio(palettes.copper[text], palettes.copper[background]);
      expect(ratio).toBeGreaterThanOrEqual(minimum);
    },
  );
});
