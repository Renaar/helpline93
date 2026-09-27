import { createContext, useContext } from 'react';
import type { Rect } from './layout.ts';

export interface StageGeometry {
  /** Current scale of the 1920 × 1080 stage. */
  scale: number;
  /** The stage element (null before mount). */
  root: HTMLElement | null;
}

export const StageContext = createContext<StageGeometry>({ scale: 1, root: null });

export function useStageScale(): number {
  return useContext(StageContext).scale;
}

export function useStageGeometry(): StageGeometry {
  return useContext(StageContext);
}

/** Converts an element's on-screen box to logical stage coordinates. */
export function toStageRect(element: Element, { scale, root }: StageGeometry): Rect {
  const box = element.getBoundingClientRect();
  const origin = root?.getBoundingClientRect() ?? { left: 0, top: 0 };
  return {
    x: (box.left - origin.left) / scale,
    y: (box.top - origin.top) / scale,
    width: box.width / scale,
    height: box.height / scale,
  };
}
