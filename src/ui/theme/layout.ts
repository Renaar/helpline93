/** Logical resolution of HelplineOS (GDD 8.4). Everything is drawn at this size, then scaled. */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

/** Taskbar height, in logical pixels (also exposed as --taskbar-height in tokens.css). */
export const TASKBAR_HEIGHT = 52;

/** Visible part of a window that must stay on screen when dragged away. */
export const WINDOW_KEEP_VISIBLE = 120;
export const TITLEBAR_HEIGHT = 36;

/** Smallest size a window can be resized to. */
export const WINDOW_MIN_WIDTH = 360;
export const WINDOW_MIN_HEIGHT = 200;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The area above the taskbar where windows live. */
export const DESKTOP_AREA: Rect = {
  x: 0,
  y: 0,
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT - TASKBAR_HEIGHT,
};
