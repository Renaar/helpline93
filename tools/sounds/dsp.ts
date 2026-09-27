/** Small synthesis toolkit for the placeholder sounds (mono, 44.1 kHz). */
import type { Rng } from '../../src/engine/rng.ts';

export interface Recipe {
  /** Fixed noise seed, so a sound never changes when other recipes are added or reordered. */
  seed: number;
  render: (rng: Rng) => Signal;
}

export const SAMPLE_RATE = 44_100;

export type Signal = Float32Array;

export function buffer(seconds: number): Signal {
  return new Float32Array(Math.ceil(seconds * SAMPLE_RATE));
}

/** Exponential decay envelope with a tiny attack to avoid clicks at sample 0. */
function envelope(i: number, attack: number, decay: number): number {
  const t = i / SAMPLE_RATE;
  const a = attack > 0 ? Math.min(1, t / attack) : 1;
  return a * Math.exp(-t / decay);
}

export function addNoise(
  out: Signal,
  rng: Rng,
  gain: number,
  decay: number,
  lowpass: number,
): void {
  // One-pole low-pass: lowpass in (0, 1], 1 = unfiltered.
  let y = 0;
  for (let i = 0; i < out.length; i++) {
    const x = rng() * 2 - 1;
    y += lowpass * (x - y);
    out[i] = (out[i] ?? 0) + y * gain * envelope(i, 0.0005, decay);
  }
}

export function addTone(
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
export function highpass(signal: Signal, amount: number): Signal {
  let low = 0;
  return signal.map((x) => {
    low += amount * (x - low);
    return x - low;
  });
}

export function normalize(signal: Signal, peak: number): Signal {
  let max = 0;
  for (const x of signal) max = Math.max(max, Math.abs(x));
  const k = max > 0 ? peak / max : 0;
  // Short fade-out on the last 5 ms to avoid a click at the end.
  const fade = Math.floor(0.005 * SAMPLE_RATE);
  return signal.map((x, i) => x * k * Math.min(1, (signal.length - i) / fade));
}

export function toWav(signal: Signal): Buffer {
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

/** Short filtered noise burst starting at `at` seconds (a tick, a click, a scratch grain). */
export function addClick(
  out: Signal,
  rng: Rng,
  at: number,
  gain: number,
  decay: number,
  lowpass: number,
): void {
  const start = Math.floor(at * SAMPLE_RATE);
  let y = 0;
  for (let i = start; i < out.length; i++) {
    const local = (i - start) / SAMPLE_RATE;
    const env = Math.min(1, local / 0.0004) * Math.exp(-local / decay);
    if (env < 1e-4 && local > decay) break;
    y += lowpass * (rng() * 2 - 1 - y);
    out[i] = (out[i] ?? 0) + y * gain * env;
  }
}

/** Multiplies the signal by a linear fade-in and fade-out (seconds). */
export function fade(signal: Signal, fadeIn: number, fadeOut: number): Signal {
  const inSamples = Math.max(1, fadeIn * SAMPLE_RATE);
  const outSamples = Math.max(1, fadeOut * SAMPLE_RATE);
  return signal.map(
    (x, i) => x * Math.min(1, i / inSamples) * Math.min(1, (signal.length - i) / outSamples),
  );
}
