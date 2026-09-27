import type { Rect } from '../theme/layout.ts';
import { toStageRect, type StageGeometry } from '../theme/stageScale.ts';
import type { AppId } from './apps.ts';
import { useWindows } from './windowStore.ts';

/**
 * Where something should fly to: an element marked `data-flight-target="<anchor>"` inside an
 * app window (it follows the window, even minimized), else the app's taskbar button.
 */
export function flightTarget(anchor: string, app: AppId, geometry: StageGeometry): Rect | null {
  const element = document.querySelector(`[data-flight-target="${anchor}"]`);
  if (element) return toStageRect(element, geometry);
  const { taskOrder, taskbarRects } = useWindows.getState();
  return taskOrder.includes(app) ? (taskbarRects[app] ?? null) : null;
}

/** The on-screen box of an element found by selector, in stage coordinates. */
export function elementRect(selector: string, geometry: StageGeometry): Rect | null {
  const element = document.querySelector(selector);
  return element ? toStageRect(element, geometry) : null;
}
