import { create } from 'zustand';

/** Mail presentation state: the open message. */
export const useMail = create<{ selected: string | null; select: (id: string) => void }>()(
  (set) => ({
    selected: null,
    select: (selected) => {
      set({ selected });
    },
  }),
);
