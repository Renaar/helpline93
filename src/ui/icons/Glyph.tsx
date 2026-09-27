import { cx } from '../cx.ts';
import styles from './Glyph.module.css';

/** Tiny pixel glyphs on an 8 × 8 grid (window controls, arrows), drawn in the current colour. */
const glyphs = {
  minimize: [
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '.XXXXXX.',
    '.XXXXXX.',
  ],
  close: [
    'XX....XX',
    '.XX..XX.',
    '..XXXX..',
    '...XX...',
    '..XXXX..',
    '.XX..XX.',
    'XX....XX',
    '........',
  ],
  prev: [
    '....XX..',
    '...XXX..',
    '..XXXX..',
    '.XXXXX..',
    '.XXXXX..',
    '..XXXX..',
    '...XXX..',
    '....XX..',
  ],
  next: [
    '..XX....',
    '..XXX...',
    '..XXXX..',
    '..XXXXX.',
    '..XXXXX.',
    '..XXXX..',
    '..XXX...',
    '..XX....',
  ],
  plus: [
    '........',
    '...XX...',
    '...XX...',
    '.XXXXXX.',
    '.XXXXXX.',
    '...XX...',
    '...XX...',
    '........',
  ],
  minus: [
    '........',
    '........',
    '........',
    '.XXXXXX.',
    '.XXXXXX.',
    '........',
    '........',
    '........',
  ],
  /** Sizing grip of a window's bottom-right corner. */
  grip: [
    '........',
    '......X.',
    '.....X..',
    '....X.X.',
    '...X.X..',
    '..X.X.X.',
    '.X.X.X..',
    '........',
  ],
} as const satisfies Record<string, readonly string[]>;

export type GlyphName = keyof typeof glyphs;

export function Glyph({ name, className }: { name: GlyphName; className?: string | undefined }) {
  return (
    <svg
      className={cx(styles.glyph, className)}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {glyphs[name].flatMap((row, y) =>
        Array.from(row, (pixel, x) =>
          pixel === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null,
        ),
      )}
    </svg>
  );
}
