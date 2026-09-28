import { create } from 'zustand';
import type { Verb } from '../../../engine/dialogue/types.ts';
import type { Rect } from '../../theme/layout.ts';

/** Reply-zone state of the Operator Chat (pure presentation: the engine decides the rest). */
export interface ChatState {
  verb: Verb;
  /** Instruction being filled in (parameters), if any. */
  selected: string | null;
  params: Record<string, string>;
  /** Options that just arrived (they glow for a moment). */
  fresh: string[];
  /** Tabs holding options the operator has not looked at yet. */
  unseen: Verb[];
  /** Where each capture started, for its flight to the ticket (stage coordinates). */
  captureSources: Record<string, Rect>;
  setVerb: (verb: Verb) => void;
  select: (instructionId: string | null) => void;
  setParam: (name: string, value: string) => void;
  addFresh: (ids: string[], verbs: Verb[]) => void;
  removeFresh: (ids: string[]) => void;
  setCaptureSource: (captureId: string, rect: Rect) => void;
  reset: () => void;
}

export const useChat = create<ChatState>()((set) => ({
  verb: 'ask',
  selected: null,
  params: {},
  fresh: [],
  unseen: [],
  captureSources: {},
  setVerb: (verb) => {
    set((state) => ({ verb, unseen: state.unseen.filter((v) => v !== verb) }));
  },
  select: (selected) => {
    set({ selected, params: {} });
  },
  setParam: (name, value) => {
    set((state) => ({ params: { ...state.params, [name]: value } }));
  },
  addFresh: (ids, verbs) => {
    set((state) => ({
      fresh: [...state.fresh, ...ids.filter((id) => !state.fresh.includes(id))],
      unseen: [
        ...state.unseen,
        ...verbs.filter((v) => v !== state.verb && !state.unseen.includes(v)),
      ],
    }));
  },
  removeFresh: (ids) => {
    set((state) => ({ fresh: state.fresh.filter((id) => !ids.includes(id)) }));
  },
  setCaptureSource: (captureId, rect) => {
    set((state) => ({ captureSources: { ...state.captureSources, [captureId]: rect } }));
  },
  reset: () => {
    set({ verb: 'ask', selected: null, params: {}, fresh: [], unseen: [], captureSources: {} });
  },
}));
