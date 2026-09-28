import { create } from 'zustand';
import { loadedSave } from '../../session/saveGame.ts';

/** Free notes of the Notebook (GDD 4.7), saved with the game at the end of each night. */
export interface NotebookState {
  notes: string;
  setNotes: (notes: string) => void;
}

export const useNotebook = create<NotebookState>()((set) => ({
  notes: loadedSave()?.notes ?? '',
  setNotes: (notes) => {
    set({ notes });
  },
}));
