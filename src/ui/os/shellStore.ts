import { create } from 'zustand';
import type { AppId } from './apps.ts';

/** Transient desktop state: start menu, selected icon, dismissed call notification. */
export interface ShellState {
  startMenuOpen: boolean;
  selectedIcon: AppId | null;
  /** The incoming-call window the player hid (per call id). */
  hiddenCallId: string | null;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  selectIcon: (app: AppId | null) => void;
  hideCall: (callId: string) => void;
}

export const useShell = create<ShellState>()((set) => ({
  startMenuOpen: false,
  selectedIcon: null,
  hiddenCallId: null,
  toggleStartMenu: () => {
    set((state) => ({ startMenuOpen: !state.startMenuOpen }));
  },
  closeStartMenu: () => {
    set({ startMenuOpen: false });
  },
  selectIcon: (app) => {
    set({ selectedIcon: app });
  },
  hideCall: (callId) => {
    set({ hiddenCallId: callId });
  },
}));
