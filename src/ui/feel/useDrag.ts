import { useRef, type PointerEvent } from 'react';
import { useStageScale } from '../theme/stageScale.ts';
import { audio } from './audio.ts';

/** Distance (logical px) before a press becomes a drag, so simple clicks stay silent. */
const DRAG_THRESHOLD = 3;
/** How far back in time pointer samples are used to measure the release velocity. */
const VELOCITY_WINDOW_MS = 80;

export interface DragCallbacks {
  onStart?: () => void;
  /** Offset since the press, in logical stage pixels. */
  onMove: (dx: number, dy: number) => void;
  /** Release velocity in logical pixels per second. */
  onEnd?: (vx: number, vy: number) => void;
}

interface Sample {
  x: number;
  y: number;
  t: number;
}

/**
 * Pointer dragging corrected for the stage scale, with pick/drop sounds (GDD 8.3 Draggable).
 * Returns the handlers to spread on the handle element.
 */
export function useDrag({ onStart, onMove, onEnd }: DragCallbacks) {
  const scale = useStageScale();
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const dragging = useRef(false);
  const samples = useRef<Sample[]>([]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    // Buttons inside the handle (e.g. window controls) keep their own behaviour.
    if ((event.target as Element).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    dragging.current = false;
    samples.current = [{ x: event.clientX, y: event.clientY, t: event.timeStamp }];
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const start = origin.current;
    if (start?.id !== event.pointerId) return;
    const dx = (event.clientX - start.x) / scale;
    const dy = (event.clientY - start.y) / scale;
    if (!dragging.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragging.current = true;
      audio.play('drag.pick');
      onStart?.();
    }
    samples.current.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
    samples.current = samples.current.filter((s) => event.timeStamp - s.t <= VELOCITY_WINDOW_MS);
    onMove(dx, dy);
  };

  const finish = (event: PointerEvent<HTMLElement>) => {
    if (origin.current?.id !== event.pointerId) return;
    origin.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    audio.play('drag.drop');
    const first = samples.current[0];
    const elapsed = first ? (event.timeStamp - first.t) / 1000 : 0;
    const vx = first && elapsed > 0 ? (event.clientX - first.x) / scale / elapsed : 0;
    const vy = first && elapsed > 0 ? (event.clientY - first.y) / scale / elapsed : 0;
    onEnd?.(vx, vy);
  };

  return { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish };
}
