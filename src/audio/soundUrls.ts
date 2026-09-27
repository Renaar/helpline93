import { soundDefinitions, type SoundId } from './soundDefinitions.ts';

const files = import.meta.glob<string>('../../assets/sounds/*.wav', {
  eager: true,
  query: '?url',
  import: 'default',
});

function urlFor(name: string): string {
  const url = files[`../../assets/sounds/${name}.wav`];
  if (url === undefined) throw new Error(`Missing sound file assets/sounds/${name}.wav`);
  return url;
}

/** Resolved URLs of every sound variant, keyed by sound id. */
export const soundUrls = Object.fromEntries(
  Object.entries(soundDefinitions).map(([id, definition]) => [id, definition.variants.map(urlFor)]),
) as Record<SoundId, string[]>;
