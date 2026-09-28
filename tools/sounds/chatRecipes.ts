/**
 * J2 communication sounds (chat, capture, tickets).
 * Same rule as J0 and J1: soft and muffled, never aggressive (GDD 5.1).
 */
import {
  addClick,
  addNoise,
  addTone,
  buffer,
  fade,
  highpass,
  normalize,
  type Recipe,
} from './dsp.ts';

/** A caller message arrives: two soft, close notes. */
function receive(seed: number, first: number, second: number): Recipe {
  return {
    seed,
    render: () => {
      const s = buffer(0.2);
      addTone(s, first, first, 0.7, 0.03, { wave: 'triangle', attack: 0.004 });
      addTone(s, second, second, 0.6, 0.04, { start: 0.055, wave: 'triangle', attack: 0.004 });
      return normalize(fade(s, 0.004, 0.05), 0.35);
    },
  };
}

/** Felt marker on paper: a short brush that brightens, with a faint squeak. */
function marker(seed: number, length: number, squeak: number): Recipe {
  return {
    seed,
    render: (rng) => {
      const s = buffer(length);
      let y = 0;
      for (let i = 0; i < s.length; i++) {
        const p = i / s.length;
        const swell = Math.sin(Math.PI * p) ** 1.5;
        const brightness = 0.12 + 0.3 * p;
        y += brightness * (rng() * 2 - 1 - y);
        s[i] = y * swell;
      }
      addTone(s, squeak, squeak * 1.08, 0.05, length / 3, { start: length * 0.3, attack: 0.02 });
      return normalize(fade(highpass(s, 0.06), 0.01, 0.04), 0.35);
    },
  };
}

export const chatRecipes: Record<string, Recipe> = {
  'chat-receive-1': receive(701, 587, 698),
  'chat-receive-2': receive(702, 554, 659),
  // The operator sends a line: a soft key-down thock.
  'chat-send-1': {
    seed: 703,
    render: (rng) => {
      const s = buffer(0.09);
      addTone(s, 190, 120, 0.6, 0.012, { attack: 0.002 });
      addClick(s, rng, 0, 0.6, 0.0018, 0.35);
      return normalize(s, 0.4);
    },
  },
  'capture-mark-1': marker(704, 0.2, 1500),
  'capture-mark-2': marker(705, 0.24, 1350),
  // New options land in the chat: a gentle ascending pair (validation, GDD 4.2.2).
  'option-unlock-1': {
    seed: 706,
    render: () => {
      const s = buffer(0.36);
      addTone(s, 659, 659, 0.6, 0.05, { wave: 'triangle', attack: 0.006 });
      addTone(s, 988, 988, 0.5, 0.08, { start: 0.09, wave: 'triangle', attack: 0.006 });
      return normalize(fade(s, 0.006, 0.08), 0.35);
    },
  },
  // Ticket closed: a rubber stamp, low and padded.
  'ticket-stamp-1': {
    seed: 707,
    render: (rng) => {
      const s = buffer(0.2);
      addTone(s, 120, 70, 1, 0.025, { attack: 0.002 });
      addClick(s, rng, 0, 0.7, 0.006, 0.18);
      addNoise(s, rng, 0.15, 0.03, 0.1);
      return normalize(s, 0.55);
    },
  },
  // A clue joins the Notebook: a tiny pencil scribble (GDD 4.7).
  'pen-write-1': {
    seed: 708,
    render: (rng) => {
      const s = buffer(0.22);
      for (const [at, gain] of [
        [0, 0.8],
        [0.05, 0.6],
        [0.11, 0.9],
        [0.16, 0.5],
      ] as const) {
        addClick(s, rng, at, gain, 0.018, 0.5);
      }
      return normalize(fade(highpass(s, 0.3), 0.005, 0.04), 0.3);
    },
  },
};
