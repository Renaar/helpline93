import { create } from 'zustand';
import type { CaptureField } from '../../../content/schemas.ts';

export type HelpDeskTab = 'current' | 'history';

/** HelpDesk presentation state. */
export interface HelpDeskState {
  tab: HelpDeskTab;
  /** Ticket picked in the history (null: the current call's ticket). */
  picked: string | null;
  /** Code chosen for the closure, by ticket. */
  codes: Record<string, string>;
  /** Fields that just received a capture (they glow). */
  flashing: CaptureField[];
  setTab: (tab: HelpDeskTab) => void;
  pick: (ticketId: string | null) => void;
  chooseCode: (ticketId: string, code: string) => void;
  flash: (field: CaptureField) => void;
  unflash: (field: CaptureField) => void;
}

export const useHelpDesk = create<HelpDeskState>()((set) => ({
  tab: 'current',
  picked: null,
  codes: {},
  flashing: [],
  setTab: (tab) => {
    set({ tab });
  },
  pick: (picked) => {
    set({ picked, tab: 'current' });
  },
  chooseCode: (ticketId, code) => {
    set((state) => ({ codes: { ...state.codes, [ticketId]: code } }));
  },
  flash: (field) => {
    set((state) => ({ flashing: [...state.flashing.filter((f) => f !== field), field] }));
  },
  unflash: (field) => {
    set((state) => ({ flashing: state.flashing.filter((f) => f !== field) }));
  },
}));
