import { create } from 'zustand';
import { docs } from '../../../content/docs.ts';

export const ZOOM_STEPS = [0.75, 0.9, 1, 1.15, 1.3, 1.5] as const;
const DEFAULT_ZOOM_INDEX = 2;

export type ViewerTab = 'contents' | 'bookmarks' | 'search';

/** Viewer state, kept while the window is closed (the manual reopens where it was left). */
export interface ViewerState {
  /** Page currently in view. */
  pageId: string;
  /** Page the view must scroll to (the nonce lets the same page be requested twice). */
  target: { pageId: string; nonce: number; smooth: boolean } | null;
  zoomIndex: number;
  bookmarks: string[];
  tab: ViewerTab;
  query: string;
  /** Scroll to a page (sidebar, previous / next). */
  goTo: (pageId: string, smooth?: boolean) => void;
  /** The scroll position reached another page. */
  setPage: (pageId: string) => void;
  zoomBy: (steps: number) => void;
  toggleBookmark: (pageId: string) => void;
  setTab: (tab: ViewerTab) => void;
  setQuery: (query: string) => void;
}

let nonce = 0;

export const useViewer = create<ViewerState>()((set) => ({
  pageId: docs.pages[0]?.id ?? '',
  target: null,
  zoomIndex: DEFAULT_ZOOM_INDEX,
  bookmarks: [],
  tab: 'contents',
  query: '',
  goTo: (pageId, smooth = true) => {
    nonce += 1;
    set({ pageId, target: { pageId, nonce, smooth } });
  },
  setPage: (pageId) => {
    set({ pageId });
  },
  zoomBy: (steps) => {
    set((state) => ({
      zoomIndex: Math.min(ZOOM_STEPS.length - 1, Math.max(0, state.zoomIndex + steps)),
    }));
  },
  toggleBookmark: (pageId) => {
    set((state) => ({
      bookmarks: state.bookmarks.includes(pageId)
        ? state.bookmarks.filter((id) => id !== pageId)
        : [...state.bookmarks, pageId],
    }));
  },
  setTab: (tab) => {
    set({ tab });
  },
  setQuery: (query) => {
    set({ query });
  },
}));
