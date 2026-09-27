/**
 * Synthesizes the placeholder UI sounds into assets/sounds/ (16-bit mono WAV).
 * Deterministic: running it twice produces identical files.
 * These are original sounds made by this script, so they carry no third-party licence.
 * Usage: npm run sounds:generate
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRng, type Rng } from '../src/engine/rng.ts';

const SAMPLE_RATE = 44_100;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

type Signal = Float32Array;

function buffer(seconds: number): Signal {
  return new Float32Array(Math.ceil(seconds * SAMPLE_RATE));
}

/** Exponential decay envelope with a tiny attack to avoid clicks at sample 0. */
function envelope(i: number, attack: number, decay: number): number {
  const t = i / SAMPLE_RATE;
  const a = attack > 0 ? Math.min(1, t / attack) : 1;
  return a * Math.exp(-t / decay);
}

function addNoise(out: Signal, rng: Rng, gain: number, decay: number, lowpass: number): void {
  // One-pole low-pass: lowpass in (0, 1], 1 = unfiltered.
  let y = 0;
  for (let i = 0; i < out.length; i++) {
    const x = rng() * 2 - 1;
    y += lowpass * (x - y);
    out[i] = (out[i] ?? 0) + y * gain * envelope(i, 0.0005, decay);
  }
}

function addTone(
  out: Signal,
  from: number,
  to: number,
  gain: number,
  decay: number,
  options: { start?: number; wave?: 'sine' | 'triangle'; attack?: number } = {},
): void {
  const startSample = Math.floor((options.start ?? 0) * SAMPLE_RATE);
  const wave = options.wave ?? 'sine';
  let phase = 0;
  for (let i = startSample; i < out.length; i++) {
    const local = i - startSample;
    const progress = Math.min(1, local / (decay * 4 * SAMPLE_RATE));
    const freq = from + (to - from) * progress;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const s = wave === 'sine' ? Math.sin(phase) : (2 / Math.PI) * Math.asin(Math.sin(phase));
    out[i] = (out[i] ?? 0) + s * gain * envelope(local, options.attack ?? 0.001, decay);
  }
}

/** High-pass by subtracting a low-passed copy. */
function highpass(signal: Signal, amount: number): Signal {
  let low = 0;
  return signal.map((x) => {
    low += amount * (x - low);
    return x - low;
  });
}

function normalize(signal: Signal, peak: number): Signal {
  let max = 0;
  for (const x of signal) max = Math.max(max, Math.abs(x));
  const k = max > 0 ? peak / max : 0;
  // Short fade-out on the last 5 ms to avoid a click at the end.
  const fade = Math.floor(0.005 * SAMPLE_RATE);
  return signal.map((x, i) => x * k * Math.min(1, (signal.length - i) / fade));
}

function toWav(signal: Signal): Buffer {
  const data = Buffer.alloc(signal.length * 2);
  signal.forEach((x, i) => {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x)) * 32767), i * 2);
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

interface Recipe {
  /** Fixed noise seed, so a sound never changes when other recipes are added or reordered. */
  seed: number;
  render: (rng: Rng) => Signal;
}

// Soft and muffled, never aggressive: the UI must stay restful over a long night shift (GDD 5.1).
const recipes: Record<string, Recipe> = {
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

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, recipe] of Object.entries(recipes)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(recipe.render(createRng(recipe.seed))));
  console.log(`wrote ${file}`);
}
