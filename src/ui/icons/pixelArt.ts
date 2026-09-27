import type { PaletteColor } from '../theme/palette.ts';

/** A pixel drawing: one string per row, one character per pixel, `.` = transparent. */
export type PixelArt = readonly string[];

export const PIXEL_GRID = 32;

/** Letters allowed in pixel art, and the palette colour each one stands for (GDD 6.4). */
export const PIXEL_PALETTE = {
  k: 'bevelDark',
  n: 'surface',
  b: 'bevelLight',
  A: 'amber',
  a: 'amberDim',
  V: 'violet',
  v: 'violetDeep',
  r: 'alert',
} as const satisfies Record<string, PaletteColor>;

export type PixelLetter = keyof typeof PIXEL_PALETTE;

export interface PixelRun {
  x: number;
  y: number;
  width: number;
  color: PaletteColor;
}

function isPixelLetter(char: string): char is PixelLetter {
  return Object.hasOwn(PIXEL_PALETTE, char);
}

/** Merges horizontal runs of same-coloured pixels, so an icon renders as few SVG rects. */
export function toRuns(art: PixelArt): PixelRun[] {
  const runs: PixelRun[] = [];
  art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const char = row.charAt(x);
      let end = x + 1;
      while (row.charAt(end) === char) end++;
      if (isPixelLetter(char)) runs.push({ x, y, width: end - x, color: PIXEL_PALETTE[char] });
      x = end;
    }
  });
  return runs;
}

/** Returns a description of every problem in the drawing (wrong size, unknown letter). */
export function validatePixelArt(art: PixelArt): string[] {
  const problems: string[] = [];
  if (art.length !== PIXEL_GRID) problems.push(`has ${art.length} rows instead of ${PIXEL_GRID}`);
  art.forEach((row, y) => {
    if (row.length !== PIXEL_GRID) problems.push(`row ${y} has ${row.length} pixels`);
    for (const char of row) {
      if (char !== '.' && !isPixelLetter(char))
        problems.push(`row ${y} uses unknown letter "${char}"`);
    }
  });
  return problems;
}
