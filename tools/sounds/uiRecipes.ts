/** J0 interface sounds, validated by Loïc: do not change (same seeds = identical files). */
import { addNoise, addTone, buffer, highpass, normalize, type Recipe } from './dsp.ts';

// Soft and muffled, never aggressive: the UI must stay restful over a long night shift (GDD 5.1).
export const uiRecipes: Record<string, Recipe> = {
  // Press: a small, dry high tick (this was the J0 hover sound, kept identical: same seed).
  'ui-press-1': {
    seed: 93,
    render: (rng) => {
      const s = buffer(0.02);
      addNoise(s, rng, 1, 0.0015, 0.9);
      return normalize(highpass(s, 0.3), 0.5);
    },
  },
  'ui-press-2': {
    seed: 94,
    render: (rng) => {
      const s = buffer(0.02);
      addNoise(s, rng, 1, 0.0012, 1);
      return normalize(highpass(s, 0.4), 0.5);
    },
  },
  // Release: the same tick, shorter and more muffled.
  'ui-release-1': {
    seed: 201,
    render: (rng) => {
      const s = buffer(0.015);
      addNoise(s, rng, 1, 0.0009, 0.55);
      return normalize(highpass(s, 0.25), 0.45);
    },
  },
  'ui-release-2': {
    seed: 202,
    render: (rng) => {
      const s = buffer(0.015);
      addNoise(s, rng, 1, 0.0008, 0.5);
      return normalize(highpass(s, 0.2), 0.45);
    },
  },
  // Hover: barely there, a soft muffled brush.
  'ui-hover-1': {
    seed: 301,
    render: (rng) => {
      const s = buffer(0.015);
      addNoise(s, rng, 1, 0.0007, 0.35);
      return normalize(highpass(s, 0.15), 0.3);
    },
  },
  'ui-hover-2': {
    seed: 302,
    render: (rng) => {
      const s = buffer(0.015);
      addNoise(s, rng, 1, 0.0006, 0.3);
      return normalize(highpass(s, 0.12), 0.3);
    },
  },
  // Refusal: a short, low, felt-covered knock.
  'ui-deny-1': {
    seed: 401,
    render: (rng) => {
      const s = buffer(0.12);
      addTone(s, 110, 62, 1, 0.022, { attack: 0.004 });
      addNoise(s, rng, 0.12, 0.012, 0.04);
      return normalize(s, 0.6);
    },
  },
  'ui-deny-2': {
    seed: 402,
    render: (rng) => {
      const s = buffer(0.12);
      addTone(s, 100, 58, 1, 0.024, { attack: 0.004 });
      addNoise(s, rng, 0.1, 0.012, 0.035);
      return normalize(s, 0.6);
    },
  },
  // Validation: two soft, low, rounded notes (sine, slow attack), quickly gone.
  'ui-confirm-1': {
    seed: 501,
    render: () => {
      const s = buffer(0.18);
      addTone(s, 440, 440, 0.6, 0.03, { attack: 0.008 });
      addTone(s, 587, 587, 0.5, 0.04, { attack: 0.008, start: 0.055 });
      return normalize(s, 0.55);
    },
  },
};
