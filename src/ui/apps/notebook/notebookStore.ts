import { create } from 'zustand';

/** Free notes of the Notebook (GDD 4.7). Saved with the game from J3. */
export interface NotebookState {
  notes: string;
  setNotes: (notes: string) => void;
}

export const useNotebook = create<NotebookState>()((set) => ({
  notes: '',
  setNotes: (notes) => {
    set({ notes });
  },
}));
