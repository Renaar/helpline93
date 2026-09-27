/**
 * J1 HelplineOS sounds (boot, windows, keyboard, phone).
 * Same rule as J0: soft and muffled, never aggressive (GDD 5.1).
 */
import {
  SAMPLE_RATE,
  addClick,
  addNoise,
  addTone,
  buffer,
  fade,
  highpass,
  normalize,
  type Recipe,
} from './dsp.ts';

/** HDD head seeks: a few muffled grains at irregular intervals. */
function hddSeek(seed: number, grains: number, length: number): Recipe {
  return {
    seed,
    render: (rng) => {
      const s = buffer(length);
      let t = 0.005;
      for (let g = 0; g < grains && t < length - 0.03; g++) {
        addClick(s, rng, t, 0.6 + rng() * 0.4, 0.0015 + rng() * 0.001, 0.35 + rng() * 0.2);
        t += 0.025 + rng() * 0.06;
      }
      return normalize(highpass(s, 0.08), 0.45);
    },
  };
}

/**
 * Keyboard: a single tiny, muffled tick. It repeats constantly, so it must be forgotten
 * (GDD 6.5: repetitive sounds stay far below one-off sounds).
 */
function key(seed: number, lowpass: number): Recipe {
  return {
    seed,
    render: (rng) => {
      const s = buffer(0.025);
      addClick(s, rng, 0, 1, 0.0009, lowpass);
      return normalize(highpass(s, 0.04), 0.3);
    },
  };
}

/** Soft pitch sweep with a breath of noise (window transitions). */
function sweep(seed: number, from: number, to: number, length: number): Recipe {
  return {
    seed,
    render: (rng) => {
      const s = buffer(length);
      addTone(s, from, to, 0.7, length / 4, { attack: 0.01 });
      addNoise(s, rng, 0.15, length / 5, 0.12);
      return normalize(fade(s, 0.008, 0.03), 0.4);
    },
  };
}

/** Paper page turning: a short, soft, band-limited brush. */
function pageTurn(seed: number, length: number): Recipe {
  return {
    seed,
    render: (rng) => {
      const s = buffer(length);
      let y = 0;
      for (let i = 0; i < s.length; i++) {
        const p = i / s.length;
        const swell = Math.sin(Math.PI * p) ** 2;
        y += 0.18 * (rng() * 2 - 1 - y);
        s[i] = y * swell;
      }
      return normalize(highpass(s, 0.05), 0.3);
    },
  };
}

export const osRecipes: Record<string, Recipe> = {
  'page-turn-1': pageTurn(622, 0.13),
  'page-turn-2': pageTurn(623, 0.15),
  // Jump to a page from the contents or a search result: one short, soft tick.
  'viewer-jump-1': {
    seed: 624,
    render: (rng) => {
      const s = buffer(0.03);
      addClick(s, rng, 0, 1, 0.0012, 0.3);
      return normalize(highpass(s, 0.05), 0.3);
    },
  },
  // Power switch: a soft, low clack.
  'os-power-1': {
    seed: 601,
    render: (rng) => {
      const s = buffer(0.16);
      addTone(s, 95, 60, 1, 0.02, { attack: 0.002 });
      addClick(s, rng, 0, 0.5, 0.004, 0.2);
      addClick(s, rng, 0.03, 0.25, 0.003, 0.15);
      return normalize(s, 0.6);
    },
  },
  // Hard disk spinning up at boot: a low whine rising, very quiet.
  'os-spinup-1': {
    seed: 602,
    render: (rng) => {
      const s = buffer(1.6);
      let phase = 0;
      for (let i = 0; i < s.length; i++) {
        const p = i / s.length;
        const freq = 70 + 170 * Math.sqrt(p);
        phase += (2 * Math.PI * freq) / SAMPLE_RATE;
        s[i] = Math.sin(phase) * 0.5 + Math.sin(phase * 2) * 0.15;
      }
      addNoise(s, rng, 0.1, 1.2, 0.05);
      return normalize(fade(s, 0.4, 0.5), 0.35);
    },
  },
  'os-hdd-1': hddSeek(603, 5, 0.3),
  'os-hdd-2': hddSeek(604, 7, 0.4),
  'os-hdd-3': hddSeek(605, 4, 0.25),
  // POST beep: one short, round tone.
  'bios-beep-1': {
    seed: 606,
    render: () => {
      const s = buffer(0.16);
      addTone(s, 880, 880, 1, 0.05, { attack: 0.006 });
      return normalize(fade(s, 0.006, 0.04), 0.45);
    },
  },
  'window-open-1': sweep(607, 320, 520, 0.14),
  'window-close-1': sweep(608, 480, 290, 0.12),
  'window-minimize-1': sweep(609, 420, 210, 0.16),
  'window-restore-1': sweep(610, 220, 430, 0.16),
  'menu-open-1': sweep(611, 380, 460, 0.08),
  // Dragging: a soft pick-up tick and a muffled set-down.
  'drag-pick-1': {
    seed: 612,
    render: (rng) => {
      const s = buffer(0.03);
      addClick(s, rng, 0, 1, 0.0012, 0.45);
      return normalize(highpass(s, 0.2), 0.4);
    },
  },
  'drag-drop-1': {
    seed: 613,
    render: (rng) => {
      const s = buffer(0.08);
      addTone(s, 150, 95, 0.8, 0.012, { attack: 0.002 });
      addClick(s, rng, 0, 0.5, 0.002, 0.3);
      return normalize(s, 0.45);
    },
  },
  'key-1': key(614, 0.28),
  'key-2': key(615, 0.24),
  'key-3': key(616, 0.3),
  'key-4': key(617, 0.26),
  // 1993 office phone: a soft electronic trill (two tones alternating quickly).
  'phone-ring-1': {
    seed: 618,
    render: () => {
      const length = 1.1;
      const s = buffer(length);
      let phase = 0;
      for (let i = 0; i < s.length; i++) {
        const t = i / SAMPLE_RATE;
        const freq = Math.floor(t * 16) % 2 === 0 ? 660 : 830;
        phase += (2 * Math.PI * freq) / SAMPLE_RATE;
        const burst = t < 0.45 || (t > 0.6 && t < 1.05) ? 1 : 0;
        s[i] = Math.sin(phase) * burst;
      }
      let y = 0;
      const smoothed = s.map((x) => (y += 0.08 * (x - y)));
      return normalize(fade(smoothed, 0.02, 0.06), 0.5);
    },
  },
  // Handset lifted / put down.
  'phone-pickup-1': {
    seed: 619,
    render: (rng) => {
      const s = buffer(0.14);
      addClick(s, rng, 0, 0.7, 0.003, 0.3);
      addTone(s, 180, 120, 0.5, 0.012, { start: 0.01 });
      addClick(s, rng, 0.05, 0.3, 0.002, 0.25);
      return normalize(s, 0.5);
    },
  },
  'phone-hangup-1': {
    seed: 620,
    render: (rng) => {
      const s = buffer(0.16);
      addTone(s, 130, 75, 1, 0.02, { attack: 0.002 });
      addClick(s, rng, 0, 0.6, 0.004, 0.2);
      return normalize(s, 0.55);
    },
  },
  // Hold: two soft notes going down.
  'phone-hold-1': {
    seed: 621,
    render: () => {
      const s = buffer(0.22);
      addTone(s, 523, 523, 0.6, 0.03, { attack: 0.008 });
      addTone(s, 392, 392, 0.6, 0.045, { attack: 0.008, start: 0.07 });
      return normalize(s, 0.45);
    },
  },
};
