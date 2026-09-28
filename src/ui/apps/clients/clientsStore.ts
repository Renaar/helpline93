import { create } from 'zustand';
import { useWindows } from '../../os/windowStore.ts';

/** Client database presentation state, kept while the window is closed. */
export interface ClientsState {
  query: string;
  selected: string | null;
  setQuery: (query: string) => void;
  select: (id: string | null) => void;
}

export const useClients = create<ClientsState>()((set) => ({
  query: '',
  selected: null,
  setQuery: (query) => {
    set({ query });
  },
  select: (selected) => {
    set({ selected });
  },
}));

/** Opens the client database on a keyword (captured serial number, name, place…). */
export function searchClientBase(keyword: string): void {
  useClients.setState({ query: keyword, selected: null });
  useWindows.getState().open('clients');
}
