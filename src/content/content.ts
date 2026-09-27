import { loadBundle } from './bundle.ts';

const sources = import.meta.glob<string>('../../content/**/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Paths relative to content/, as content:check sees them. */
const files = Object.fromEntries(
  Object.entries(sources).map(([path, source]) => [path.replace(/^.*?content\//, ''), source]),
);

/** All game content, validated at load (content:check does the same earlier, with warnings). */
export const content = loadBundle(files);
