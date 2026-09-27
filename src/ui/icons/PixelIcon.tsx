import { cx } from '../cx.ts';
import { paletteCssVar } from '../theme/palette.ts';
import { iconArt, type IconName } from './iconArt.ts';
import { PIXEL_GRID, toRuns, type PixelRun } from './pixelArt.ts';
import styles from './PixelIcon.module.css';

const runCache = new Map<IconName, PixelRun[]>();

function runsFor(name: IconName): PixelRun[] {
  let runs = runCache.get(name);
  if (!runs) {
    runs = toRuns(iconArt[name]);
    runCache.set(name, runs);
  }
  return runs;
}

export interface PixelIconProps {
  name: IconName;
  /** sm = 32 px, md = 48 px (×1.5), lg = 64 px (×2). */
  size?: 'sm' | 'md' | 'lg';
  className?: string | undefined;
}

/** Renders a pixel-art icon as crisp SVG, coloured with the theme variables. */
export function PixelIcon({ name, size = 'md', className }: PixelIconProps) {
  return (
    <svg
      className={cx(styles.icon, styles[size], className)}
      viewBox={`0 0 ${PIXEL_GRID} ${PIXEL_GRID}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {runsFor(name).map((run) => (
        <rect
          key={`${run.x}-${run.y}`}
          x={run.x}
          y={run.y}
          width={run.width}
          height={1}
          fill={`var(${paletteCssVar(run.color)})`}
        />
      ))}
    </svg>
  );
}
