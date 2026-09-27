import { create } from 'zustand';

/** Player-facing settings. The Control Panel app will edit these later (GDD 5.6). */
export interface SettingsState {
  muted: boolean;
  reducedMotion: boolean;
  toggleMuted: () => void;
  toggleReducedMotion: () => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const useSettings = create<SettingsState>()((set) => ({
  muted: false,
  reducedMotion: prefersReducedMotion(),
  toggleMuted: () => {
    set((state) => ({ muted: !state.muted }));
  },
  toggleReducedMotion: () => {
    set((state) => ({ reducedMotion: !state.reducedMotion }));
  },
}));
