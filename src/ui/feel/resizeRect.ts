import type { Rect } from '../theme/layout.ts';

/** Which edges a resize handle moves: n(orth), s(outh), e(ast), w(est), or a corner. */
export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const RESIZE_EDGES: readonly ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export interface ResizeLimits {
  bounds: Rect;
  minWidth: number;
  minHeight: number;
}

/**
 * The window box after dragging `edge` by (dx, dy) from `start`. The opposite edges stay put,
 * the size never goes below the minimum, and the window never leaves `bounds`.
 */
export function resizeRect(
  start: Rect,
  edge: ResizeEdge,
  dx: number,
  dy: number,
  { bounds, minWidth, minHeight }: ResizeLimits,
): Rect {
  let { x, y, width, height } = start;
  const right = start.x + start.width;
  const bottom = start.y + start.height;

  if (edge.includes('e')) {
    width = Math.min(bounds.x + bounds.width - start.x, Math.max(minWidth, start.width + dx));
  }
  if (edge.includes('w')) {
    x = Math.max(bounds.x, Math.min(right - minWidth, start.x + dx));
    width = right - x;
  }
  if (edge.includes('s')) {
    height = Math.min(bounds.y + bounds.height - start.y, Math.max(minHeight, start.height + dy));
  }
  if (edge.startsWith('n')) {
    y = Math.max(bounds.y, Math.min(bottom - minHeight, start.y + dy));
    height = bottom - y;
  }
  return { x, y, width, height };
}
