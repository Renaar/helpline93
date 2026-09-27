import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PALETTE, palettes, type PaletteName } from '../theme/palette.ts';

/** Player-facing settings. The Control Panel app will edit these later (GDD 5.6). */
export interface SettingsState {
  muted: boolean;
  reducedMotion: boolean;
  /** Active colour palette (sandbox comparison, J0 review). */
  palette: PaletteName;
  toggleMuted: () => void;
  toggleReducedMotion: () => void;
  setPalette: (palette: PaletteName) => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      reducedMotion: prefersReducedMotion(),
      palette: DEFAULT_PALETTE,
      toggleMuted: () => {
        set((state) => ({ muted: !state.muted }));
      },
      toggleReducedMotion: () => {
        set((state) => ({ reducedMotion: !state.reducedMotion }));
      },
      setPalette: (palette) => {
        set({ palette });
      },
    }),
    {
      name: 'helpline93.settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only the palette survives a reload for now; the rest arrives with the Control Panel.
      partialize: (state) => ({ palette: state.palette }),
      merge: (persisted, current) => {
        const palette = (persisted as { palette?: unknown } | undefined)?.palette;
        return typeof palette === 'string' && Object.hasOwn(palettes, palette)
          ? { ...current, palette: palette as PaletteName }
          : current;
      },
    },
  ),
);
