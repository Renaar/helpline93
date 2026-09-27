import { describe, expect, it } from 'vitest';
import { createRng } from '../engine/rng.ts';
import { pickVariant, varyPlayback } from './variation.ts';

describe('varyPlayback', () => {
  it('stays within ±pitch and ±volume ranges', () => {
    const rng = createRng(1);
    for (let i = 0; i < 500; i++) {
      const { rate, volume } = varyPlayback(0.5, 0.05, 0.1, rng);
      expect(rate).toBeGreaterThanOrEqual(0.95);
      expect(rate).toBeLessThanOrEqual(1.05);
      expect(volume).toBeGreaterThanOrEqual(0.45);
      expect(volume).toBeLessThanOrEqual(0.55);
    }
  });

  it('actually varies', () => {
    const rng = createRng(2);
    const rates = new Set(Array.from({ length: 10 }, () => varyPlayback(1, 0.05, 0.1, rng).rate));
    expect(rates.size).toBeGreaterThan(5);
  });

  it('never exceeds full volume', () => {
    expect(varyPlayback(1, 0, 0.5, () => 0.999).volume).toBe(1);
  });
});

describe('pickVariant', () => {
  it('never repeats the previous variant when there is a choice', () => {
    const rng = createRng(3);
    let previous = pickVariant(3, rng);
    for (let i = 0; i < 200; i++) {
      const next = pickVariant(3, rng, previous);
      expect(next).not.toBe(previous);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(3);
      previous = next;
    }
  });

  it('returns 0 for a single variant', () => {
    expect(pickVariant(1, () => 0.7, 0)).toBe(0);
  });
});
