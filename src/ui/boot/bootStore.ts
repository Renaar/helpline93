import { create } from 'zustand';

/** Power-on sequence (GDD 2.2 / 5.3): off → BIOS → login → desktop. */
export type BootPhase = 'off' | 'bios' | 'login' | 'desktop';

export interface BootState {
  phase: BootPhase;
  setPhase: (phase: BootPhase) => void;
}

/** `?boot=skip` and `?mission=<id>` go straight to the desktop (development convenience). */
function initialPhase(): BootPhase {
  if (typeof window === 'undefined') return 'off';
  const params = new URLSearchParams(window.location.search);
  return params.get('boot') === 'skip' || params.has('mission') ? 'desktop' : 'off';
}

export const useBoot = create<BootState>()((set) => ({
  phase: initialPhase(),
  setPhase: (phase) => {
    set({ phase });
  },
}));
