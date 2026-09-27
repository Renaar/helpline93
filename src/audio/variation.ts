export interface PlaybackVariation {
  /** Playback rate: 1 = original pitch. */
  rate: number;
  /** Final volume, clamped to [0, 1]. */
  volume: number;
}

/** Symmetric random offset in [-range, +range]. */
function spread(range: number, random: () => number): number {
  return (random() * 2 - 1) * range;
}

/**
 * Slight random pitch and volume change so repeated sounds never feel machine-gunned (GDD 8.5).
 * `pitchRange` 0.05 = ±5 %, `volumeRange` 0.1 = ±10 %.
 */
export function varyPlayback(
  baseVolume: number,
  pitchRange: number,
  volumeRange: number,
  random: () => number,
): PlaybackVariation {
  const rate = 1 + spread(pitchRange, random);
  const volume = Math.min(1, Math.max(0, baseVolume * (1 + spread(volumeRange, random))));
  return { rate, volume };
}

/** Picks a variant index, avoiding the previous one when there is a choice. */
export function pickVariant(count: number, random: () => number, previous?: number): number {
  if (count <= 1) return 0;
  if (previous === undefined) return Math.floor(random() * count);
  const index = Math.floor(random() * (count - 1));
  return index >= previous ? index + 1 : index;
}
