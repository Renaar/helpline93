import { create } from 'zustand';
import type { WindowPhase } from '../feel/Window95.tsx';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';
import type { Rect } from '../theme/layout.ts';
import { appInfo, type AppId } from './apps.ts';

export interface WindowEntry {
  app: AppId;
  phase: WindowPhase;
  rect: Rect;
  /** Icon or menu item the window unfolds from. */
  openFrom: Rect | null;
}

export interface WindowStoreState {
  /** Open windows, bottom → top (stacking order). */
  windows: WindowEntry[];
  /** Taskbar order: the order in which windows were opened. */
  taskOrder: AppId[];
  /** Applications being "loaded" (staged latency, hourglass cursor). */
  loading: AppId[];
  /** Taskbar button boxes, where windows fold into when minimized. */
  taskbarRects: Partial<Record<AppId, Rect>>;
  open: (app: AppId, from?: Rect | null, rect?: Rect) => void;
  focus: (app: AppId) => void;
  minimize: (app: AppId) => void;
  restore: (app: AppId) => void;
  close: (app: AppId) => void;
  /** Removes a window once its close animation is over. */
  closed: (app: AppId) => void;
  move: (app: AppId, x: number, y: number) => void;
  /** Places windows (opening the missing ones among `openMissing`). */
  arrange: (layout: Partial<Record<AppId, Rect>>, openMissing: AppId[]) => void;
  setTaskbarRect: (app: AppId, rect: Rect) => void;
}

function randomLatency(): number {
  const { min, max } = feelConfig.window.openLatencyMs;
  return min + Math.random() * (max - min);
}

function sameRect(a: Rect | undefined, b: Rect): boolean {
  return a?.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

/** Moves a window to the top of the stack. */
function toTop(windows: WindowEntry[], app: AppId): WindowEntry[] {
  const entry = windows.find((w) => w.app === app);
  return entry ? [...windows.filter((w) => w.app !== app), entry] : windows;
}

function update(windows: WindowEntry[], app: AppId, patch: Partial<WindowEntry>): WindowEntry[] {
  return windows.map((w) => (w.app === app ? { ...w, ...patch } : w));
}

/** The focused window: the topmost one that is open. */
export function focusedApp(windows: WindowEntry[]): AppId | null {
  for (let i = windows.length - 1; i >= 0; i--) {
    const entry = windows[i];
    if (entry?.phase === 'open') return entry.app;
  }
  return null;
}

export const useWindows = create<WindowStoreState>()((set, get) => ({
  windows: [],
  taskOrder: [],
  loading: [],
  taskbarRects: {},

  open: (app, from = null, rect) => {
    const { windows, loading } = get();
    const existing = windows.find((w) => w.app === app);
    if (existing && existing.phase !== 'closing') {
      if (rect) get().move(app, rect.x, rect.y);
      if (existing.phase === 'minimized') get().restore(app);
      else get().focus(app);
      return;
    }
    if (loading.includes(app)) return;
    // Staged latency (GDD 5.1): hourglass + disk scratch, then the window unfolds.
    set({ loading: [...loading, app] });
    audio.play('os.hdd');
    setTimeout(() => {
      set((state) => ({
        loading: state.loading.filter((id) => id !== app),
        windows: [
          ...state.windows.filter((w) => w.app !== app),
          { app, phase: 'open', rect: rect ?? appInfo[app].defaultRect, openFrom: from },
        ],
        taskOrder: state.taskOrder.includes(app) ? state.taskOrder : [...state.taskOrder, app],
      }));
    }, randomLatency());
  },

  focus: (app) => {
    set((state) => ({ windows: toTop(state.windows, app) }));
  },

  minimize: (app) => {
    set((state) => ({ windows: update(state.windows, app, { phase: 'minimized' }) }));
  },

  restore: (app) => {
    set((state) => ({ windows: toTop(update(state.windows, app, { phase: 'open' }), app) }));
  },

  close: (app) => {
    set((state) => ({
      windows: update(state.windows, app, { phase: 'closing' }),
      taskOrder: state.taskOrder.filter((id) => id !== app),
    }));
  },

  closed: (app) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.app !== app || w.phase !== 'closing'),
    }));
  },

  move: (app, x, y) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.app === app ? { ...w, rect: { ...w.rect, x, y } } : w)),
    }));
  },

  arrange: (layout, openMissing) => {
    const { windows } = get();
    for (const [app, rect] of Object.entries(layout) as [AppId, Rect][]) {
      const entry = windows.find((w) => w.app === app && w.phase !== 'closing');
      if (entry) {
        set((state) => ({
          windows: update(state.windows, app, { rect, phase: 'open' }),
        }));
      } else if (openMissing.includes(app)) {
        get().open(app, null, rect);
      }
    }
  },

  setTaskbarRect: (app, rect) => {
    if (sameRect(get().taskbarRects[app], rect)) return;
    set((state) => ({ taskbarRects: { ...state.taskbarRects, [app]: rect } }));
  },
}));
